import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from datetime import datetime, timedelta

from fastapi.testclient import TestClient

from database import get_connection, initialize_and_load
from main import app
from utils.fetch_forecast import get_latest_forecast


client = TestClient(app)


def test_forecast_api_matches_database():
    initialize_and_load()

    delivery_date = "2026-01-04"
    decision_time = "03:00"

    response = client.post(
        "/api/forecasts",
        json={
            "deliveryDate": delivery_date,
            "decisionTime": decision_time,
        },
    )

    assert response.status_code == 200

    api_data = response.json()
    api_forecasts = api_data["forecasts"]

    decision_date = (
        datetime.fromisoformat(delivery_date).date()
        - timedelta(days=1)
    )

    decision_dt = datetime.fromisoformat(
        f"{decision_date.isoformat()}T"
        f"{decision_time}:00+00:00"
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

    expected = []

    for (start_time,) in delivery_intervals:
        result = get_latest_forecast(
            datetime.fromisoformat(
                start_time.replace("Z", "+00:00")
            ),
            decision_dt,
        )

        if result:
            expected.append(result)
        else:
            expected.append(
                {
                    "startTime": start_time,
                    "publishTime": None,
                    "generation": None,
                }
            )

    assert api_forecasts == expected

def test_accuracy_api_matches_database():
    initialize_and_load()

    start_date = "2026-01-01"
    end_date = "2026-01-07"
    decision_time = "03:00"

    response = client.post(
        "/api/accuracy",
        json={
            "startDate": start_date,
            "endDate": end_date,
            "decisionTime": decision_time,
        },
    )

    assert response.status_code == 200

    api_data = response.json()

    from utils.fetch_actual import get_actual_generation
    from utils.calculate_metrics import calculate_metrics

    start_dt = datetime.fromisoformat(start_date).date()
    end_dt = datetime.fromisoformat(end_date).date()

    all_forecasts = []
    all_actuals = []

    current_date = start_dt

    while current_date <= end_dt:
        delivery_date = current_date.isoformat()
        decision_date = current_date - timedelta(days=1)

        decision_dt = datetime.fromisoformat(
            f"{decision_date.isoformat()}T"
            f"{decision_time}:00+00:00"
        )

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
            result = get_latest_forecast(
                datetime.fromisoformat(
                    start_time.replace("Z", "+00:00")
                ),
                decision_dt,
            )

            if result:
                all_forecasts.append(result)

        all_actuals.extend(
            get_actual_generation(delivery_date)
        )

        current_date += timedelta(days=1)

    expected_metrics = calculate_metrics(
        all_forecasts,
        all_actuals,
    )

    expected_metrics = {
    "mae": round(expected_metrics["mae"], 3)
    if expected_metrics["mae"] is not None
    else None,
    "rmse": round(expected_metrics["rmse"], 3)
    if expected_metrics["rmse"] is not None
    else None,
    "mbe": round(expected_metrics["mbe"], 3)
    if expected_metrics["mbe"] is not None
    else None,
    "validIntervals": expected_metrics["validIntervals"],
}

    assert api_data["metrics"] == expected_metrics

def test_forecast_uses_latest_available_vintage():
    response = client.post(
        "/api/forecasts",
        json={
            "deliveryDate": "2026-01-04",
            "decisionTime": "03:00",
        },
    )

    assert response.status_code == 200

    forecasts = response.json()["forecasts"]

    assert len(forecasts) == 24

    first = forecasts[0]

    assert first["startTime"] == "2026-01-04T00:00:00Z"
    assert first["publishTime"] == "2026-01-03T02:30:00Z"
    assert first["generation"] == 16659

def test_forecast_unavailable_before_first_publication():
    response = client.post(
        "/api/forecasts",
        json={
            "deliveryDate": "2026-01-04",
            "decisionTime": "01:00",
        },
    )

    assert response.status_code == 200

    forecasts = response.json()["forecasts"]

    assert len(forecasts) == 24

    assert all(
        forecast["publishTime"] is None
        for forecast in forecasts
    )

    assert all(
        forecast["generation"] is None
        for forecast in forecasts
    )

def test_all_intervals_use_selected_vintage():
    response = client.post(
        "/api/forecasts",
        json={
            "deliveryDate": "2026-01-04",
            "decisionTime": "03:00",
        },
    )

    assert response.status_code == 200

    forecasts = response.json()["forecasts"]

    assert len(forecasts) == 24

    assert all(
        forecast["publishTime"] == "2026-01-03T02:30:00Z"
        for forecast in forecasts
    )

def test_forecast_decision_date_is_previous_day():
    response = client.post(
        "/api/forecasts",
        json={
            "deliveryDate": "2026-01-04",
            "decisionTime": "03:00",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["deliveryDate"] == "2026-01-04"
    assert data["decisionDate"] == "2026-01-03"
    assert data["decisionTime"] == "03:00"

def test_accuracy_returns_expected_interval_count():
    response = client.post(
        "/api/accuracy",
        json={
            "startDate": "2026-01-01",
            "endDate": "2026-01-07",
            "decisionTime": "03:00",
        },
    )

    assert response.status_code == 200

    metrics = response.json()["metrics"]

    assert metrics["validIntervals"] == 168