import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import random
from datetime import datetime, timedelta

from database import get_connection, initialize_and_load
from utils.fetch_forecast import get_latest_forecast


def test_all_january_dates_exist():
    initialize_and_load()

    conn = get_connection()

    forecast_dates = {
        row[0][:10]
        for row in conn.execute(
            "SELECT DISTINCT start_time FROM wind_forecasts"
        ).fetchall()
    }

    actual_dates = {
        row[0][:10]
        for row in conn.execute(
            "SELECT DISTINCT start_time FROM actual_generation"
        ).fetchall()
    }

    conn.close()

    expected_dates = {
        f"2026-01-{day:02d}"
        for day in range(1, 32)
    }

    assert expected_dates <= forecast_dates
    assert expected_dates <= actual_dates


def test_latest_forecast_matches_sql():
    initialize_and_load()

    conn = get_connection()

    # Pick a delivery interval with multiple forecast vintages.
    start_time = conn.execute(
        """
        SELECT start_time
        FROM wind_forecasts
        GROUP BY start_time
        HAVING COUNT(*) >= 2
        ORDER BY RANDOM()
        LIMIT 1
        """
    ).fetchone()[0]

    publish_times = [
        row[0]
        for row in conn.execute(
            """
            SELECT publish_time
            FROM wind_forecasts
            WHERE start_time = ?
            ORDER BY publish_time
            """,
            (start_time,),
        ).fetchall()
    ]

    conn.close()

    # Use the date of the first publication as the decision day.
    first = datetime.fromisoformat(
        publish_times[0].replace("Z", "+00:00")
    )

    same_day_publish_times = [
        datetime.fromisoformat(
            publish_time.replace("Z", "+00:00")
        )
        for publish_time in publish_times
        if publish_time[:10] == first.strftime("%Y-%m-%d")
    ]

    # Need at least two forecasts published on the same day
    # so we can test the "latest available before decision" logic.
    assert len(same_day_publish_times) >= 2

    first = same_day_publish_times[0]
    second = same_day_publish_times[1]

    # Decision happens between the first and second publication.
    decision_time = first + (second - first) / 2

    actual = get_latest_forecast(
        datetime.fromisoformat(
            start_time.replace("Z", "+00:00")
        ),
        decision_time,
    )

    conn = get_connection()

    expected = conn.execute(
        """
        SELECT
            start_time,
            publish_time,
            generation
        FROM wind_forecasts
        WHERE start_time = ?
          AND date(publish_time) = ?
          AND publish_time <= ?
        ORDER BY publish_time DESC
        LIMIT 1
        """,
        (
            start_time,
            decision_time.date().isoformat(),
            decision_time.isoformat().replace("+00:00", "Z"),
        ),
    ).fetchone()

    conn.close()

    assert actual is not None
    assert expected is not None

    assert actual["startTime"] == expected[0]
    assert actual["publishTime"] == expected[1]
    assert actual["generation"] == expected[2]