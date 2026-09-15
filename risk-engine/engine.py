import sys
import json
from rules import calculate_hourly_risk


def analyze_day(weather, date, start_time, duration, elevation):
    hourly = weather["hourly"]

    start_datetime = f"{date}T{start_time}"

    if start_datetime not in hourly["time"]:
        raise ValueError(
            f"Weather data not available for {start_datetime}"
        )

    start_index = hourly["time"].index(start_datetime)
    end_index = start_index + int(duration)

    if end_index > len(hourly["time"]):
        raise ValueError(
            f"Trek duration extends beyond available weather data for {date}"
        )

    hourly_results = []

    for i in range(start_index, end_index):

        result = calculate_hourly_risk(
            temperature=hourly["temperature_2m"][i],
            humidity=hourly["relative_humidity_2m"][i],
            wind_speed=hourly["wind_speed_10m"][i],
            precipitation=hourly["precipitation"][i],
            precipitation_probability=hourly["precipitation_probability"][i],
            elevation=elevation
        )

        hourly_results.append({
            "time": hourly["time"][i],
            "temperature": hourly["temperature_2m"][i],
            "humidity": hourly["relative_humidity_2m"][i],
            "wind_speed": hourly["wind_speed_10m"][i],
            "precipitation": hourly["precipitation"][i],
            "precipitation_probability": hourly["precipitation_probability"][i],
            **result
        })

    scores = [hour["score"] for hour in hourly_results]

    average_score = sum(scores) / len(scores)
    maximum_score = max(scores)

    overall_score = round(
        maximum_score * 0.6 +
        average_score * 0.4
    )

    if overall_score >= 60:
        overall_risk = "HIGH"
    elif overall_score >= 30:
        overall_risk = "MODERATE"
    else:
        overall_risk = "LOW"

    all_reasons = []

    for hour in hourly_results:
        all_reasons.extend(hour["reasons"])

    unique_reasons = list(dict.fromkeys(all_reasons))

    return {
        "date": date,
        "overall_score": overall_score,
        "overall_risk": overall_risk,
        "reasons": unique_reasons,
        "hourly": hourly_results
    }


def analyze_week(weather, start_time, duration, elevation):
    hourly = weather["hourly"]

    dates = sorted(
        set(time.split("T")[0] for time in hourly["time"])
    )

    weekly_results = []

    for date in dates:

        try:
            result = analyze_day(
                weather=weather,
                date=date,
                start_time=start_time,
                duration=duration,
                elevation=elevation
            )

            weekly_results.append({
                "date": date,
                "overall_score": result["overall_score"],
                "overall_risk": result["overall_risk"],
                "reasons": result["reasons"]
            })

        except ValueError:
            # Skip dates where the requested trek window
            # is not available.
            continue

    return weekly_results


def analyze_trek(weather, date, start_time, duration, elevation):

    selected_day = analyze_day(
        weather=weather,
        date=date,
        start_time=start_time,
        duration=duration,
        elevation=elevation
    )

    weekly_results = analyze_week(
        weather=weather,
        start_time=start_time,
        duration=duration,
        elevation=elevation
    )

        # Only recommend the selected date or future dates
    future_days = [
        day for day in weekly_results
        if day["date"] >= date
    ]

    # Sort from lowest risk to highest risk
    sorted_week = sorted(
        future_days,
        key=lambda day: day["overall_score"]
    )
    # Keep the best 3 days
    recommendations = sorted_week[:3]

    return {
        **selected_day,
        "weekly": weekly_results,
        "recommendations": recommendations
    }


if __name__ == "__main__":

    input_data = json.loads(sys.stdin.read())

    result = analyze_trek(
        weather=input_data["weather"],
        date=input_data["date"],
        start_time=input_data["startTime"],
        duration=input_data["duration"],
        elevation=input_data["elevation"]
    )

    print(json.dumps(result))