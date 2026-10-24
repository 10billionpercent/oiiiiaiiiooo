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

    return {
        "deliveryDate": request.deliveryDate,
        "decisionDate": decision_date.isoformat(),
        "decisionTime": request.decisionTime,
        "forecasts": forecasts,
    }