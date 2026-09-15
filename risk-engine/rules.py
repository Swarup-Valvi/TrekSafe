def calculate_hourly_risk(
    temperature,
    humidity,
    wind_speed,
    precipitation,
    precipitation_probability,
    elevation
):
    score = 0
    reasons = []

    # -------------------------
    # Temperature
    # -------------------------
    if temperature >= 40:
        score += 35
        reasons.append("Extreme heat")
    elif temperature >= 35:
        score += 25
        reasons.append("Very high temperature")
    elif temperature >= 30:
        score += 15
        reasons.append("High temperature")

    # -------------------------
    # Humidity
    # Keep this as a minor factor
    # -------------------------
    if humidity >= 90:
        score += 8
        reasons.append("Very high humidity")
    elif humidity >= 80:
        score += 5
        reasons.append("High humidity")

    # -------------------------
    # Wind
    # -------------------------
    if wind_speed >= 50:
        score += 35
        reasons.append("Dangerously strong winds")
    elif wind_speed >= 40:
        score += 25
        reasons.append("Strong winds")
    elif wind_speed >= 30:
        score += 15
        reasons.append("High wind speed")

    # -------------------------
    # Actual precipitation
    # This is the major rain factor
    # -------------------------
    if precipitation >= 10:
        score += 35
        reasons.append("Heavy precipitation")
    elif precipitation >= 5:
        score += 25
        reasons.append("Moderate precipitation")
    elif precipitation >= 2:
        score += 15
        reasons.append("Light precipitation")

    # -------------------------
    # Probability of precipitation
    # Only add a small amount because
    # actual precipitation is more important
    # -------------------------
    if precipitation_probability >= 90:
        score += 8
        reasons.append("Very high chance of precipitation")
    elif precipitation_probability >= 70:
        score += 5
        reasons.append("High chance of precipitation")

    # -------------------------
    # Elevation
    # Elevation modifies other risks
    # rather than being dangerous by itself
    # -------------------------
    if elevation >= 2500:
        score += 10
        reasons.append("High elevation")
    elif elevation >= 1500:
        score += 5
        reasons.append("Elevated terrain")

    # -------------------------
    # Combined conditions
    # -------------------------

    # Heat + humidity
    if temperature >= 30 and humidity >= 80:
        score += 10
        reasons.append("Hot and humid conditions")

    # Strong wind + elevation
    if wind_speed >= 35 and elevation >= 1500:
        score += 10
        reasons.append("Strong winds at elevation")

    # Rain + elevation
    if precipitation >= 5 and elevation >= 1000:
        score += 10
        reasons.append("Rain at elevated terrain")

    # -------------------------
    # Risk level
    # -------------------------
    if score >= 60:
        risk_level = "HIGH"
    elif score >= 30:
        risk_level = "MODERATE"
    else:
        risk_level = "LOW"

    return {
        "score": score,
        "risk_level": risk_level,
        "reasons": reasons
    }