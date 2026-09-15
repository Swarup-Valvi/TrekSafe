# TrekSafe

**Weather-based trek risk assessment and planning application.**

TrekSafe helps trekkers evaluate weather conditions for a planned trek by combining location data, terrain elevation, weather forecasts, and a rule-based risk assessment engine.

## Overview

Before starting a trek, weather conditions can change significantly throughout the planned trek window. TrekSafe analyzes the forecast across the entire duration of a trek rather than looking at a single weather value.

The application provides:

* Location-based trek planning
* Automatic latitude and longitude detection
* Automatic terrain elevation detection
* Hourly weather analysis
* Rule-based trek risk assessment
* LOW, MODERATE, and HIGH risk levels
* Explanations for identified risk factors
* Weekly recommendations for alternative trek days

## How It Works

```text
Trek Location
      ↓
Nominatim / OpenStreetMap
      ↓
Latitude + Longitude
      ↓
Open-Meteo
 ├── Weather Forecast
 └── Elevation
      ↓
Python Rule-Based Risk Engine
      ↓
Risk Score + Risk Level + Reasons
      ↓
React Results Dashboard
```

## Tech Stack

### Frontend

* React
* Vite
* Axios
* React Router

### Backend

* Node.js
* Express
* Axios

### Risk Engine

* Python
* Rule-based decision logic

### APIs

* Open-Meteo for weather and elevation data
* Nominatim / OpenStreetMap for location search

## Risk Assessment

TrekSafe evaluates multiple weather and terrain factors:

* Temperature
* Humidity
* Wind speed
* Precipitation
* Precipitation probability
* Terrain elevation
* Combined weather conditions

Each hourly period receives a risk score.

The overall trek score combines the **maximum hourly risk** and the **average risk across the trek duration**, allowing short periods of severe conditions to influence the final assessment.

Risk levels:

| Score | Risk Level |
| ----: | ---------- |
|  0–29 | LOW        |
| 30–59 | MODERATE   |
|   60+ | HIGH       |

## Project Structure

```text
TrekSafe/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── routes/
│   ├── services/
│   ├── users.js
│   ├── server.js
│   └── package.json
│
├── risk-engine/
│   ├── engine.py
│   ├── rules.py
│   └── requirements.txt
│
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/TrekSafe.git
cd TrekSafe
```

### 2. Start the backend

```bash
cd server
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:5050
```

### 3. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will be available through the Vite development server.

### 4. Set up the Python risk engine

```bash
cd risk-engine

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

## Demo Login

The current development version uses predefined users instead of a database-backed authentication system.

```text
Username: trekker1
Password: trek123
```

## Important Notes

TrekSafe provides a **weather-based risk assessment**, not a guarantee of trekking safety.

Actual trail conditions can also depend on factors such as trail closures, terrain conditions, visibility, landslides, local warnings, and rapidly changing weather.

Weather data availability is limited to the forecast provided by Open-Meteo.

## Future Improvements

* Trail and route integration
* Weather alerts
* Additional environmental factors such as visibility and wind gusts
* Improved risk explanations
* Historical weather analysis
* User accounts and saved treks
* Interactive maps
* Mobile application

## Data Sources

* [Open-Meteo](https://open-meteo.com/)
* [OpenStreetMap](https://www.openstreetmap.org/)
* [Nominatim](https://nominatim.openstreetmap.org/)

## License

This project is currently intended for educational and development purposes.
