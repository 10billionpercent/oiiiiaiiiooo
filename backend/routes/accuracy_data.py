from datetime import datetime, timedelta

from fastapi import APIRouter
from pydantic import BaseModel

from database import get_connection
from utils.fetch_actual import get_actual_generation
from utils.fetch_forecast import get_latest_forecast


router = APIRouter(
    prefix="/api/accuracy-data",
    tags=["Real vs Forecast Data"],
)


class AccuracyRequest(BaseModel):
    startDate: str
    endDate: str
    decisionTime: str


@router.post("")
def get_real_data(request: AccuracyRequest):
    start_date = datetime.fromisoformat(
        request.startDate
    ).date()

    end_date = datetime.fromisoformat(
        request.endDate
    ).date()

    data = []

    current_date = start_date

    while current_date <= end_date:
        # Forecasts for this delivery date were available
        # from the previous day's decision.
        decision_date = current_date - timedelta(days=1)

        decision_dt = datetime.fromisoformat(
            f"{decision_date.isoformat()}T"
            f"{request.decisionTime}:00+00:00"
        )

        delivery_date = current_date.isoformat()

        # Get hourly actual generation.
        # This util converts the raw 30-minute FUELHH
        # values into hourly averages.
        actuals = get_actual_generation(delivery_date)

        actual_map = {
            actual["startTime"]: actual["generation"]
            for actual in actuals
        }

        # Get all forecast delivery intervals for this day.
        conn = get_connection()

        intervals = conn.execute(
            """
            SELECT DISTINCT start_time
            FROM wind_forecasts
            WHERE start_time LIKE ?
            ORDER BY start_time
            """,
            (f"{delivery_date}T%",),
        ).fetchall()

        conn.close()

        for (start_time,) in intervals:
            forecast = get_latest_forecast(
                datetime.fromisoformat(
                    start_time.replace("Z", "+00:00")
                ),
                decision_dt,
            )

            actual = actual_map.get(start_time)

            # Only include intervals where both
            # forecast and actual data are available.
            if not forecast or actual is None:
                continue

            error = forecast["generation"] - actual

            data.append(
                {
                    "startTime": start_time,
                    "publishTime": forecast["publishTime"],
                    "forecast": forecast["generation"],
                    "actual": actual,
                    "error": error,
                    "absoluteError": abs(error),
                }
            )

        current_date += timedelta(days=1)

    return {
        "startDate": request.startDate,
        "endDate": request.endDate,
        "decisionTime": request.decisionTime,
        "unit": "MW",
        "data": data,
    }