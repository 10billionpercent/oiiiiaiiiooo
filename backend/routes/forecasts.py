from datetime import datetime, timedelta

from fastapi import APIRouter
from pydantic import BaseModel

from database import get_connection
from utils.fetch_forecast import get_latest_forecast


router = APIRouter(
    prefix="/api/forecasts",
    tags=["Forecasts"],
)


class ForecastRequest(BaseModel):
    deliveryDate: str
    decisionTime: str


@router.post("")
def get_forecasts(request: ForecastRequest):
    delivery_dt = datetime.fromisoformat(
        request.deliveryDate
    ).date()

    decision_date = delivery_dt - timedelta(days=1)

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
        (f"{request.deliveryDate}T%",),
    ).fetchall()

    earliest_publication = conn.execute(
          """
    SELECT MIN(publish_time)
    FROM wind_forecasts
    WHERE start_time LIKE ?
      AND publish_time LIKE ?
    """,
    (
        f"{request.deliveryDate}T%",
        f"{decision_date.isoformat()}T%",
    ),
    ).fetchone()[0]

    conn.close()

    forecasts = []

    for (start_time,) in delivery_intervals:
        result = get_latest_forecast(
            datetime.fromisoformat(
                start_time.replace("Z", "+00:00")
            ),
            decision_dt,
        )

        if result:
            forecasts.append(result)
        else:
            forecasts.append(
                {
                    "startTime": start_time,
                    "publishTime": None,
                    "generation": None,
                }
            )

    available_count = sum(
        forecast["generation"] is not None
        for forecast in forecasts
    )

    missing_count = len(forecasts) - available_count

    empty_state = None

    if not delivery_intervals:
        empty_state = {
            "type": "NO_RECORDS",
            "message": (
                "No forecast data was found for this "
                "delivery day and decision date."
            ),
        }

    elif available_count == 0 and earliest_publication:
        earliest_publication_dt = datetime.fromisoformat(
            earliest_publication.replace("Z", "+00:00")
        )

        if earliest_publication_dt > decision_dt:
            empty_state = {
                "type": "NOT_AVAILABLE_YET",
                "firstPublishedAt": earliest_publication,
            }

    elif missing_count > 0:
        empty_state = {
            "type": "PARTIAL",
            "message": (
                f"{missing_count} of {len(forecasts)} intervals "
                "have no forecast available at the selected "
                "decision time."
            ),
            "missingIntervals": missing_count,
        }

    return {
        "deliveryDate": request.deliveryDate,
        "decisionDate": decision_date.isoformat(),
        "decisionTime": request.decisionTime,
        "forecasts": forecasts,
        "emptyState": empty_state,
    }