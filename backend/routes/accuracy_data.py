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

    total_intervals = 0
    available_forecasts = 0

    first_published_at = None

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

        # Find the earliest forecast publication for
        # this delivery day on its decision date.
        earliest_publication = conn.execute(
            """
            SELECT MIN(publish_time)
            FROM wind_forecasts
            WHERE start_time LIKE ?
              AND publish_time LIKE ?
            """,
            (
                f"{delivery_date}T%",
                f"{decision_date.isoformat()}T%",
            ),
        ).fetchone()[0]

        conn.close()

        total_intervals += len(intervals)

        # Track the earliest publication across the
        # selected delivery days.
        if earliest_publication:
            if (
                first_published_at is None
                or earliest_publication < first_published_at
            ):
                first_published_at = earliest_publication

        for (start_time,) in intervals:
            forecast = get_latest_forecast(
                datetime.fromisoformat(
                    start_time.replace("Z", "+00:00")
                ),
                decision_dt,
            )

            if forecast:
                available_forecasts += 1

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

    empty_state = None

    # No forecast records exist at all for the
    # selected delivery-date range.
    if total_intervals == 0:
        empty_state = {
            "type": "NO_RECORDS",
            "message": (
                "No forecast data was found for the "
                "selected date range."
            ),
        }

    # Forecast records exist, but none were available
    # by the selected decision time.
    elif available_forecasts == 0:
        empty_state = {
            "type": "NOT_AVAILABLE_YET",
            "message": (
                "No forecasts were available at the "
                "selected decision time."
            ),
            "firstPublishedAt": first_published_at,
        }

    # Some forecast intervals were available while
    # others were not.
    elif available_forecasts < total_intervals:
        empty_state = {
            "type": "PARTIAL",
            "message": (
                f"Forecast data was only available for "
                f"{available_forecasts} of {total_intervals} "
                "delivery intervals at the selected "
                "decision time."
            ),
            "availableIntervals": available_forecasts,
            "missingIntervals": (
                total_intervals - available_forecasts
            ),
        }

    # Forecasts and actuals existed, but none could
    # be matched for comparison.
    elif not data:
        empty_state = {
            "type": "NO_MATCHED_DATA",
            "message": (
                "No matching forecast and actual "
                "generation data was found for the "
                "selected date range."
            ),
        }

    return {
        "startDate": request.startDate,
        "endDate": request.endDate,
        "decisionTime": request.decisionTime,
        "unit": "MW",
        "data": data,
        "emptyState": empty_state,
    }