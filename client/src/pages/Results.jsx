import { useNavigate } from "react-router-dom";

function Results() {
  const navigate = useNavigate();

  const analysis = JSON.parse(
    localStorage.getItem("treksafe_analysis")
  );

  if (!analysis) {
    return (
      <div className="empty-results">
        <h2>No trek analysis found.</h2>
        <button onClick={() => navigate("/dashboard")}>
          Plan a trek
        </button>
      </div>
    );
  }

  const { trek, riskAnalysis } = analysis;

  const risk = riskAnalysis.overall_risk;
  const riskClass = risk.toLowerCase();

  return (
    <div className="results-page">

      {/* NAVBAR */}

      <header className="dashboard-nav">
        <div className="brand">
          <div className="brand-mark">T</div>
          <span>TrekSafe</span>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Plan another trek
        </button>
      </header>

      <main className="results-main">

        {/* HEADER */}

        <section className="results-header">
          <div>
            <p className="eyebrow dark">
              TREK ANALYSIS
            </p>

            <h1>{trek.location}</h1>

            <p className="trek-meta">
              {formatDate(trek.date)}
              <span>·</span>
              {formatTime(trek.startTime)}
              <span>–</span>
              {getEndTime(trek.startTime, trek.duration)}
            </p>
          </div>

          <div className="trek-details">
            <span>{trek.duration} hrs</span>
            <span>{trek.elevation} m elevation</span>
          </div>
        </section>

        {/* RISK HERO */}

        <section className={`risk-hero ${riskClass}`}>

          <div className="risk-score">

          <div
  className="score-ring"
  style={{
    "--score": riskAnalysis.overall_score,
  }}
>
              <div className="score-inner">
                <strong>
                  {riskAnalysis.overall_score}
                </strong>

                <span>/ 100</span>
              </div>
            </div>

          </div>

          <div className="risk-copy">

            <div className={`risk-pill ${riskClass}`}>
              <span className="risk-dot" />
              {risk}
            </div>

            <h2>
              {getRiskMessage(risk)}
            </h2>

            <p>
              Based on the weather conditions across your
              entire {trek.duration}-hour trek window.
            </p>

          </div>

          <div className="risk-side-note">
            <span>ASSESSMENT</span>
            <strong>
              {riskAnalysis.hourly.length} hourly checks
            </strong>
          </div>

        </section>

        {/* WEATHER TIMELINE */}

        <section className="results-section">

          <div className="section-title-row">

            <div>
              <p className="section-eyebrow">
                HOURLY FORECAST
              </p>

              <h2>
                Conditions during your trek
              </h2>
            </div>

            <p>
              Each hour is assessed separately.
            </p>

          </div>

          <div className="weather-timeline">

            {riskAnalysis.hourly.map((hour, index) => (

              <div
                className="weather-column"
                key={hour.time}
              >

                <div className="weather-time">
                  {formatHour(hour.time)}
                </div>

                <div
                  className={`timeline-risk ${hour.risk_level.toLowerCase()}`}
                />

                <div className="weather-icon">
                  {getWeatherIcon(hour)}
                </div>

                <div className="weather-temperature">
                  {Math.round(hour.temperature)}°
                </div>

                <div className="weather-condition">
                  {getWeatherLabel(hour)}
                </div>

                <div className="weather-divider" />

                <div className="weather-stat">
                  <span>Humidity</span>
                  <strong>{hour.humidity}%</strong>
                </div>

                <div className="weather-stat">
                  <span>Wind</span>
                  <strong>
                    {Math.round(hour.wind_speed)} km/h
                  </strong>
                </div>

                <div className="weather-stat">
                  <span>Rain</span>
                  <strong>
                    {hour.precipitation} mm
                  </strong>
                </div>

                <div className="weather-stat">
                  <span>Rain chance</span>
                  <strong>
                    {hour.precipitation_probability}%
                  </strong>
                </div>

              </div>

            ))}

          </div>

        </section>

        {/* KEY CONDITIONS */}

        <section className="conditions-grid">

          <div className="condition-card">

            <span className="condition-label">
              TEMPERATURE
            </span>

            <strong>
              {getTemperatureRange(riskAnalysis.hourly)}
            </strong>

            <p>
              Lowest to highest during your trek
            </p>

          </div>

          <div className="condition-card">

            <span className="condition-label">
              HUMIDITY
            </span>

            <strong>
              {getAverageHumidity(riskAnalysis.hourly)}%
            </strong>

            <p>
              Average relative humidity
            </p>

          </div>

          <div className="condition-card">

            <span className="condition-label">
              WIND
            </span>

            <strong>
              {getMaxWind(riskAnalysis.hourly)} km/h
            </strong>

            <p>
              Maximum wind speed
            </p>

          </div>

          <div className="condition-card">

            <span className="condition-label">
              RAIN
            </span>

            <strong>
              {getTotalRain(riskAnalysis.hourly)} mm
            </strong>

            <p>
              Total forecast precipitation
            </p>

          </div>

        </section>

        {/* WHY */}

        <section className="results-section explanation-section">

          <div className="section-title-row">

            <div>
              <p className="section-eyebrow">
                RISK BREAKDOWN
              </p>

              <h2>
                Why this assessment?
              </h2>
            </div>

          </div>

          <div className="reason-list">

            {riskAnalysis.reasons.length > 0 ? (

              riskAnalysis.reasons.map((reason) => (

                <div
                  className="reason-item"
                  key={reason}
                >

                  <div className="reason-icon">
                    !
                  </div>

                  <span>{reason}</span>

                </div>

              ))

            ) : (

              <div className="reason-item">

                <div className="reason-icon success">
                  ✓
                </div>

                <span>
                  No significant risk factors detected.
                </span>

              </div>

            )}

          </div>

        </section>

        {/* BETTER DAYS */}

        <section className="results-section">

          <div className="section-title-row">

            <div>
              <p className="section-eyebrow">
                WEEKLY OUTLOOK
              </p>

              <h2>
                Other days to consider
              </h2>
            </div>

            <p>
              Same start time and trek duration.
            </p>

          </div>

          <div className="recommendation-grid">

            {riskAnalysis.recommendations.map((day) => (

              <div
                className="recommendation-card"
                key={day.date}
              >

                <div className="recommendation-date">

                  <span>
                    {formatWeekday(day.date)}
                  </span>

                  <strong>
                    {formatShortDate(day.date)}
                  </strong>

                </div>

                <div
                  className={`recommendation-risk ${day.overall_risk.toLowerCase()}`}
                >
                  {day.overall_risk}
                </div>

                <div className="recommendation-score">
                  <strong>
                    {day.overall_score}
                  </strong>

                  <span>
                    risk score
                  </span>
                </div>

              </div>

            ))}

          </div>

        </section>

        {/* FOOTER NOTE */}

        <div className="results-disclaimer">
          TrekSafe assesses forecast conditions using a
          rule-based risk engine. It is not a guarantee of
          safety or a substitute for local trail conditions.
        </div>

      </main>

    </div>
  );
}


/* =========================
   HELPERS
========================= */

function formatDate(date) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatShortDate(date) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatWeekday(date) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function formatHour(time) {
  return new Date(time).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      hour12: true,
    }
  );
}

function formatTime(time) {
  return new Date(
    `2000-01-01T${time}`
  ).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getEndTime(startTime, duration) {
  const [hours, minutes] = startTime
    .split(":")
    .map(Number);

  const date = new Date();

  date.setHours(hours);
  date.setMinutes(
    minutes + Number(duration) * 60
  );

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getRiskMessage(risk) {
  if (risk === "LOW") {
    return "Conditions look favorable";
  }

  if (risk === "MODERATE") {
    return "Some conditions need attention";
  }

  return "Several conditions need attention";
}

function getWeatherIcon(hour) {
  if (hour.precipitation >= 2) {
    return "🌧";
  }

  if (hour.precipitation_probability >= 60) {
    return "🌦";
  }

  if (hour.humidity >= 85) {
    return "☁";
  }

  return "☀";
}

function getWeatherLabel(hour) {
  if (hour.precipitation >= 2) {
    return "Rain";
  }

  if (hour.precipitation_probability >= 60) {
    return "Possible rain";
  }

  if (hour.humidity >= 85) {
    return "Humid";
  }

  return "Clear";
}

function getTemperatureRange(hours) {
  const temperatures = hours.map(
    (hour) => hour.temperature
  );

  const min = Math.round(Math.min(...temperatures));
  const max = Math.round(Math.max(...temperatures));

  return `${min}° – ${max}°`;
}

function getAverageHumidity(hours) {
  const average =
    hours.reduce(
      (sum, hour) => sum + hour.humidity,
      0
    ) / hours.length;

  return Math.round(average);
}

function getMaxWind(hours) {
  return Math.round(
    Math.max(
      ...hours.map((hour) => hour.wind_speed)
    )
  );
}

function getTotalRain(hours) {
  const total = hours.reduce(
    (sum, hour) => sum + hour.precipitation,
    0
  );

  return total.toFixed(1);
}

export default Results;