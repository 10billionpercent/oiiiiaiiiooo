from datetime import datetime

from database import get_connection


def get_latest_forecast(
    start_time: datetime,
    decision_time: datetime,
):
    conn = get_connection()

    decision_time_str = (
        decision_time.isoformat().replace("+00:00", "Z")
    )

    decision_day_start = (
        f"{decision_time.date().isoformat()}T00:00:00Z"
    )

    forecast = conn.execute(
        """
        SELECT
            start_time,
            publish_time,
            generation
        FROM wind_forecasts
        WHERE start_time = ?
          AND publish_time >= ?
          AND publish_time <= ?
        ORDER BY publish_time DESC
        LIMIT 1
        """,
        (
            start_time.isoformat().replace("+00:00", "Z"),
            decision_day_start,
            decision_time_str,
        ),
    ).fetchone()

    conn.close()

    if not forecast:
        return None

    return {
        "startTime": forecast[0],
        "publishTime": forecast[1],
        "generation": forecast[2],
    }