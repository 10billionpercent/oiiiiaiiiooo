from datetime import datetime, timedelta

from fastapi import APIRouter
from pydantic import BaseModel

from database import get_connection
from utils.fetch_actual import get_actual_generation
from utils.fetch_forecast import get_latest_forecast
from utils.calculate_metrics import calculate_metrics


router = APIRouter(
    prefix="/api/accuracy",
    tags=["Accuracy"],
)


class AccuracyRequest(BaseModel):
    startDate: str
    endDate: str
    decisionTime: str


@router.post("")
def get_accuracy(request: AccuracyRequest):
    start_dt = datetime.fromisoformat(
        request.startDate
    ).date()

    end_dt = datetime.fromisoformat(
        request.endDate
    ).date()

    all_forecasts = []
    all_actuals = []

    current_date = start_dt

    while current_date <= end_dt:
        delivery_date = current_date.isoformat()

        decision_date = current_date - timedelta(days=1)

        decision_dt = datetime.fromisoformat(
            f"{decision_date.isoformat()}T"
            f"{request.decisionTime}:00+00:00"
        )

        conn = get_connection()

        delivery_intervals = conn.execute(
            """
            SELECT DISTINCT start_time
            FROM wind_forecasts
            WHERE start_time LIKE ?
            ORDER BY start_time
            """,
            (f"{delivery_date}T%",),
        ).fetchall()

        conn.close()

        daily_forecasts = []

        for (start_time,) in delivery_intervals:
            result = get_latest_forecast(
                datetime.fromisoformat(
                    start_time.replace("Z", "+00:00")
                ),
                decision_dt,
            )

            if result:
                daily_forecasts.append(result)

        daily_actuals = get_actual_generation(
            delivery_date
        )

        all_forecasts.extend(daily_forecasts)
        all_actuals.extend(daily_actuals)

        current_date += timedelta(days=1)

    metrics = calculate_metrics(
        all_forecasts,
        all_actuals,
    )

    return {
        "startDate": request.startDate,
        "endDate": request.endDate,
        "decisionTime": request.decisionTime,
        "unit": "MW",
         "metrics": {
            "mae": round(metrics["mae"], 3) if metrics["mae"] is not None else None,
            "rmse": round(metrics["rmse"], 3) if metrics["rmse"] is not None else None,
            "mbe": round(metrics["mbe"], 3) if metrics["mbe"] is not None else None,
            "validIntervals": metrics["validIntervals"],
        },
    }