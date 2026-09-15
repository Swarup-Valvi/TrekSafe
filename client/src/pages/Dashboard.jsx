import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("treksafe_user")
  );

  const [form, setForm] = useState({
    location: "",
    latitude: "",
    longitude: "",
    date: "2026-09-19",
    startTime: "06:00",
    duration: "6",
    elevation: "",
    manualElevation: false
  });

  const [locationResults, setLocationResults] =
    useState([]);

  const [searchingLocation, setSearchingLocation] =
    useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
    Search for trek locations.

    We wait 1 second after the user stops typing
    before sending the request.
  */
  useEffect(() => {
    if (
      !form.location ||
      form.location.trim().length < 3 ||
      selectedLocation
    ) {
      setLocationResults([]);
      return;
    }


    const timeout = setTimeout(
      async () => {
        setSearchingLocation(true);

        try {
          const response = await axios.get(
            "http://localhost:5050/api/trek/location",
            {
              params: {
                query: form.location.trim()
              }
            }
          );


          if (response.data.success) {
            setLocationResults(
              response.data.locations
            );
          } else {
            setLocationResults([]);
          }

        } catch (error) {
          console.error(
            "Location search failed:",
            error
          );

          setLocationResults([]);

        } finally {
          setSearchingLocation(false);
        }
      },
      1000
    );


    return () => clearTimeout(timeout);

  }, [
    form.location,
    selectedLocation
  ]);


  /*
    Select a location from search results.
  */
  const handleLocationSelect = (
    location
  ) => {
    setSelectedLocation(location);

    setForm((current) => ({
      ...current,

      location:
        location.name,

      latitude:
        String(location.latitude),

      longitude:
        String(location.longitude),

      elevation:
        location.elevation !== null
          ? String(location.elevation)
          : "",

      manualElevation: false
    }));

    setLocationResults([]);
    setError("");
  };


  /*
    Handle normal form changes.
  */
  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;


    /*
      If the user changes the location
      after selecting one, clear the old
      coordinates and elevation.
    */
    if (name === "location") {
      setSelectedLocation(null);

      setForm((current) => ({
        ...current,

        location: value,

        latitude: "",

        longitude: "",

        elevation: "",

        manualElevation: false
      }));

      return;
    }


    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };


  /*
    Enable manual elevation editing.
  */
  const enableManualElevation = () => {
    setForm((current) => ({
      ...current,
      manualElevation: true
    }));
  };


  /*
    Return to automatically detected elevation.
  */
  const useDetectedElevation = () => {
    if (!selectedLocation) {
      return;
    }

    setForm((current) => ({
      ...current,

      elevation:
        selectedLocation.elevation !== null
          ? String(
              selectedLocation.elevation
            )
          : "",

      manualElevation: false
    }));
  };


  /*
    Submit trek analysis.
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");


    /*
      User must select an actual
      search result.
    */
    if (!selectedLocation) {
      setError(
        "Please search for and select a trek location."
      );

      return;
    }


    if (!form.elevation) {
      setError(
        "Elevation could not be determined."
      );

      return;
    }


    setLoading(true);


    try {
      const requestData = {
        location:
          selectedLocation.name,

        latitude:
          Number(form.latitude),

        longitude:
          Number(form.longitude),

        date:
          form.date,

        startTime:
          form.startTime,

        duration:
          Number(form.duration)
      };


      /*
        Only send elevation if the user
        manually changed it.

        Otherwise backend automatically
        gets the elevation again.
      */
      if (
        form.manualElevation
      ) {
        requestData.elevation =
          Number(form.elevation);
      }


      const response =
        await axios.post(
          "http://localhost:5050/api/trek/weather",
          requestData
        );


      localStorage.setItem(
        "treksafe_analysis",
        JSON.stringify(
          response.data
        )
      );


      navigate("/results");

    } catch (error) {
      console.error(
        "Trek analysis failed:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to analyze this trek. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  /*
    Logout.
  */
  const logout = () => {
    localStorage.removeItem(
      "treksafe_user"
    );

    localStorage.removeItem(
      "treksafe_analysis"
    );

    navigate("/");
  };


  return (
    <div className="dashboard-page">

      {/* NAVBAR */}

      <header className="dashboard-nav">

        <div className="brand">

          <div className="brand-mark">
            T
          </div>

          <span>
            TrekSafe
          </span>

        </div>


        <div className="nav-right">

          <span className="user-name">
            {user?.name || "Trekker"}
          </span>

          <button
            className="logout-button"
            onClick={logout}
          >
            Log out
          </button>

        </div>

      </header>


      {/* MAIN */}

      <main className="dashboard-main">

        <div className="dashboard-heading">

          <div>

            <p className="eyebrow dark">
              PLAN YOUR TREK
            </p>

            <h1>
              Find the right
              <br />
              conditions to go.
            </h1>

            <p className="dashboard-description">
              Enter your trek details and
              TrekSafe will analyze the
              forecast across your entire
              trek window.
            </p>

          </div>

        </div>


        <form
          className="trek-form"
          onSubmit={handleSubmit}
        >


          {/* =================================
              SECTION 01
              LOCATION
          ================================= */}

          <div className="form-section">

            <div className="section-number">
              01
            </div>


            <div className="section-content">

              <div className="section-heading">

                <h2>
                  Where are you going?
                </h2>

                <p>
                  Search for your trek
                  location.
                </p>

              </div>


              <div className="location-search">

                <div className="input-field large">

                  <label>
                    Trek location
                  </label>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Kalsubai"
                    autoComplete="off"
                    required
                  />

                </div>


                {/* SEARCHING */}

                {searchingLocation && (
                  <div className="location-status">
                    Searching locations...
                  </div>
                )}


                {/* RESULTS */}

                {locationResults.length >
                  0 && (

                  <div className="location-results">

                    {locationResults.map(
                      (
                        location,
                        index
                      ) => (

                        <button
                          type="button"
                          className="location-result"
                          key={`${location.latitude}-${location.longitude}-${index}`}
                          onClick={() =>
                            handleLocationSelect(
                              location
                            )
                          }
                        >

                          <div className="location-result-icon">
                            ↗
                          </div>


                          <div className="location-result-content">

                            <strong>
                              {getLocationName(
                                location.name
                              )}
                            </strong>

                            <span>
                              {getLocationDetails(
                                location.name
                              )}
                            </span>

                          </div>

                        </button>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* SELECTED LOCATION */}

              {selectedLocation && (

                <div className="location-detected">

                  <div className="detected-icon">
                    ✓
                  </div>


                  <div className="detected-content">

                    <strong>
                      Location detected
                    </strong>

                    <span>
                      Latitude{" "}
                      {selectedLocation.latitude.toFixed(
                        5
                      )}
                      {" · "}
                      Longitude{" "}
                      {selectedLocation.longitude.toFixed(
                        5
                      )}
                    </span>

                  </div>

                </div>

              )}

            </div>

          </div>


          {/* =================================
              SECTION 02
              DATE / TIME
          ================================= */}

          <div className="form-section">

            <div className="section-number">
              02
            </div>


            <div className="section-content">

              <div className="section-heading">

                <h2>
                  When are you going?
                </h2>

                <p>
                  Choose your planned start
                  time and date.
                </p>

              </div>


              <div className="form-grid">


                {/* DATE */}

                <div className="input-field">

                  <label>
                    Date
                  </label>

                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    max={
                      new Date(
                        Date.now() +
                          6 *
                            24 *
                            60 *
                            60 *
                            1000
                      )
                        .toISOString()
                        .split("T")[0]
                    }
                    required
                  />

                </div>


                {/* START TIME */}

                <div className="input-field">

                  <label>
                    Start time
                  </label>

                  <input
                    name="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* DURATION */}

                <div className="input-field">

                  <label>
                    Duration
                  </label>

                  <select
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                  >

                    <option value="2">
                      2 hours
                    </option>

                    <option value="3">
                      3 hours
                    </option>

                    <option value="4">
                      4 hours
                    </option>

                    <option value="5">
                      5 hours
                    </option>

                    <option value="6">
                      6 hours
                    </option>

                    <option value="7">
                      7 hours
                    </option>

                    <option value="8">
                      8 hours
                    </option>

                  </select>

                </div>

              </div>

            </div>

          </div>


          {/* =================================
              SECTION 03
              ELEVATION
          ================================= */}

          <div className="form-section">

            <div className="section-number">
              03
            </div>


            <div className="section-content">

              <div className="section-heading">

                <h2>
                  Terrain elevation
                </h2>

                <p>
                  Automatically detected from
                  your selected trek location.
                </p>

              </div>


              <div className="elevation-row">


                {/* ELEVATION INPUT */}

                <div className="input-field elevation-input">

                  <label>
                    Elevation
                  </label>

                  <input
                    name="elevation"
                    type="number"
                    min="0"
                    value={form.elevation}
                    onChange={handleChange}
                    disabled={
                      !form.manualElevation
                    }
                    placeholder={
                      selectedLocation
                        ? "Elevation"
                        : "Select a location"
                    }
                    required
                  />

                  <span className="input-suffix">
                    meters
                  </span>

                </div>


                {/* ELEVATION ACTION */}

                <div className="elevation-actions">

                  {!form.manualElevation ? (

                    <button
                      type="button"
                      className="edit-elevation-button"
                      onClick={
                        enableManualElevation
                      }
                      disabled={
                        !selectedLocation
                      }
                    >
                      Edit elevation
                    </button>

                  ) : (

                    <button
                      type="button"
                      className="edit-elevation-button"
                      onClick={
                        useDetectedElevation
                      }
                    >
                      Use detected elevation
                    </button>

                  )}


                  <p>

                    {!selectedLocation

                      ? "Select a trek location first."

                      : form.manualElevation

                      ? "Manual elevation will be used for this assessment."

                      : "Automatically detected from the selected location."}

                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div className="form-error">
              {error}
            </div>

          )}


          {/* SUBMIT */}

          <div className="form-submit">

            <button
              type="submit"
              className="analyze-button"
              disabled={
                loading ||
                !selectedLocation ||
                !form.elevation
              }
            >

              {loading
                ? "Analyzing conditions..."
                : "Check trek conditions →"}

            </button>


            <span>
              Uses the latest available
              weather forecast
            </span>

          </div>

        </form>


        {/* OPENSTREETMAP ATTRIBUTION */}

        <div className="location-attribution">
          Location data © OpenStreetMap
          contributors
        </div>

      </main>

    </div>
  );
}


/*
  Extract the primary location name.
*/
function getLocationName(
  displayName
) {
  return displayName
    .split(",")[0];
}


/*
  Extract supporting location details.
*/
function getLocationDetails(
  displayName
) {
  return displayName
    .split(",")
    .slice(1, 4)
    .join(",")
    .trim();
}


export default Dashboard;