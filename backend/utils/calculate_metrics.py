import numpy as np


def calculate_metrics(forecasts, actuals):
    actual_map = {
        item["startTime"]: item["generation"]
        for item in actuals
    }

    matched_forecasts = []
    matched_actuals = []

    for forecast in forecasts:
        start_time = forecast["startTime"]

        if (
            forecast["generation"] is not None
            and start_time in actual_map
        ):
            matched_forecasts.append(forecast["generation"])
            matched_actuals.append(actual_map[start_time])

    if not matched_forecasts:
        return {
            "mae": None,
            "rmse": None,
            "mbe": None,
            "validIntervals": 0,
        }

    forecast_values = np.array(matched_forecasts)
    actual_values = np.array(matched_actuals)

    errors = forecast_values - actual_values

    mae = np.mean(np.abs(errors))
    rmse = np.sqrt(np.mean(errors ** 2))
    mbe = np.mean(errors)

    return {
        "mae": float(mae),
        "rmse": float(rmse),
        "mbe": float(mbe),
        "validIntervals": len(errors),
    }