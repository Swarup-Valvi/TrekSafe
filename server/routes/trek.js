import express from "express";
import { spawn } from "child_process";

import {
  getWeather,
  getElevation
} from "../services/openMeteo.js";

import { searchLocation } from "../services/geocoder.js";

const router = express.Router();

/*
  Run the Python Rule-Based Trek Risk Assessment Engine
*/
const runRiskEngine = (data) => {
  return new Promise((resolve, reject) => {
    const python = spawn(
      "../risk-engine/venv/bin/python",
      ["../risk-engine/engine.py"]
    );

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            errorOutput || "Risk engine failed"
          )
        );
        return;
      }

      try {
        resolve(JSON.parse(output));
      } catch (error) {
        reject(
          new Error(
            `Invalid response from risk engine: ${error.message}`
          )
        );
      }
    });

    python.stdin.write(JSON.stringify(data));
    python.stdin.end();
  });
};


/*
  SEARCH TREK LOCATION

  Example:
  GET /api/trek/location?query=Kalsubai

  Returns:
  - location name
  - latitude
  - longitude
  - elevation
*/
router.get("/location", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please enter a location."
      });
    }

    const locations = await searchLocation(
      query.trim()
    );

    if (!locations.length) {
      return res.status(404).json({
        success: false,
        message: "No matching trek location found."
      });
    }

    /*
      Get elevation for every search result.
    */
    const locationsWithElevation =
      await Promise.all(
        locations.map(async (location) => {
          try {
            const elevation =
              await getElevation(
                location.latitude,
                location.longitude
              );

            return {
              ...location,
              elevation
            };
          } catch (error) {
            return {
              ...location,
              elevation: null
            };
          }
        })
      );

    res.json({
      success: true,
      locations: locationsWithElevation
    });

  } catch (error) {
    console.error(
      "Location search error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to search for this location."
    });
  }
});


/*
  GET ELEVATION

  Example:
  GET /api/trek/elevation?latitude=19.6&longitude=73.5
*/
router.get("/elevation", async (req, res) => {
  try {
    const {
      latitude,
      longitude
    } = req.query;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude are required."
      });
    }

    const elevation = await getElevation(
      Number(latitude),
      Number(longitude)
    );

    res.json({
      success: true,
      elevation,
      source: "automatic"
    });

  } catch (error) {
    console.error(
      "Elevation detection error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to determine elevation."
    });
  }
});


/*
  ANALYZE TREK WEATHER + RISK

  Example:
  POST /api/trek/weather
*/
router.post("/weather", async (req, res) => {
  try {
    const {
      location,
      latitude,
      longitude,
      date,
      startTime,
      duration,
      elevation
    } = req.body;


    /*
      Basic validation.
    */
    if (
      !location ||
      latitude === undefined ||
      longitude === undefined ||
      !date ||
      !startTime ||
      !duration
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Location, coordinates, date, start time and duration are required."
      });
    }


    /*
      Get weather forecast from Open-Meteo.
    */
    const weather = await getWeather(
      Number(latitude),
      Number(longitude)
    );


    /*
      Automatically determine elevation
      from the selected coordinates.
    */
    const detectedElevation =
      await getElevation(
        Number(latitude),
        Number(longitude)
      );


    /*
      If user manually entered elevation,
      use that value.

      Otherwise use automatically detected elevation.
    */
    const hasManualElevation =
      elevation !== undefined &&
      elevation !== null &&
      elevation !== "" &&
      !Number.isNaN(Number(elevation));


    const finalElevation =
      hasManualElevation
        ? Number(elevation)
        : detectedElevation;


    /*
      Run Python risk engine.
    */
    const riskAnalysis =
      await runRiskEngine({
        weather,
        date,
        startTime,
        duration: Number(duration),
        elevation: finalElevation
      });


    /*
      Return everything needed by React.
    */
    res.json({
      success: true,

      trek: {
        location,
        date,
        startTime,
        duration: Number(duration),
        elevation: finalElevation,

        elevationSource:
          hasManualElevation
            ? "manual"
            : "automatic"
      },

      coordinates: {
        latitude: Number(latitude),
        longitude: Number(longitude)
      },

      weather,

      riskAnalysis
    });

  } catch (error) {
    console.error(
      "Trek analysis error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to analyze trek conditions.",

      details:
        error.response?.data || null
    });
  }
});


export default router;