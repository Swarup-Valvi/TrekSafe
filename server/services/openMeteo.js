import axios from "axios";

const geocodeLocation = async (location) => {
  const response = await axios.get(
    "https://geocoding-api.open-meteo.com/v1/search",
    {
      params: {
        name: location,
        count: 1,
        language: "en",
        format: "json"
      }
    }
  );

  if (!response.data.results?.length) {
    throw new Error(`Location not found: ${location}`);
  }

  const result = response.data.results[0];

  return {
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude
  };
};

const getWeather = async (latitude, longitude) => {
  const response = await axios.get(
    "https://api.open-meteo.com/v1/forecast",
    {
      params: {
        latitude,
        longitude,
        hourly: [
          "temperature_2m",
          "relative_humidity_2m",
          "wind_speed_10m",
          "precipitation",
          "precipitation_probability"
        ].join(","),
        timezone: "auto",
        forecast_days: 7
      }
    }
  );

  return response.data;
};

const getElevation = async (latitude, longitude) => {
  const response = await axios.get(
    "https://api.open-meteo.com/v1/elevation",
    {
      params: {
        latitude,
        longitude
      }
    }
  );

  if (
    !response.data.elevation ||
    response.data.elevation.length === 0
  ) {
    throw new Error("Unable to determine elevation");
  }

  return Math.round(response.data.elevation[0]);
};

export {
  geocodeLocation,
  getWeather,
  getElevation
};