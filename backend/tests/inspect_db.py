import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from datetime import datetime, timedelta

from database import get_connection, initialize_and_load
from utils.fetch_forecast import get_latest_forecast


def main():
    initialize_and_load()

    delivery_date = input(
        "Delivery date (YYYY-MM-DD): "
    ).strip()

    decision_time = input(
        "Decision time (HH:MM): "
    ).strip()

    # Day-ahead decision happens one day before delivery.
    delivery_dt = datetime.fromisoformat(delivery_date).date()
    decision_date = delivery_dt - timedelta(days=1)

    decision_dt = datetime.fromisoformat(
        f"{decision_date.isoformat()}T{decision_time}:00+00:00"
    )

    conn = get_connection()

    # Get all publication times available for this delivery date.
    publish_times = conn.execute(
        """
        SELECT DISTINCT publish_time
        FROM wind_forecasts
        WHERE start_time LIKE ?
          AND date(publish_time) = ?
          AND publish_time <= ?
        ORDER BY publish_time
        """,
        (
            f"{delivery_date}T%",
            decision_date.isoformat(),
            decision_dt.isoformat().replace("+00:00", "Z"),
        ),
    ).fetchall()

    # Get all delivery intervals for the selected day.
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

    print(f"\n🌬️ WINDFOR")
    print(f"Delivery date: {delivery_date}")
    print(f"Decision date: {decision_date} (today)")
    print(f"Decision time: {decision_time} UTC")

    print("\nEligible published times:")

    if publish_times:
        for (publish_time,) in publish_times:
            print(f"  {publish_time}")
    else:
        print("  No eligible forecasts available.")

    print("\n" + "=" * 70)
    print("LATEST ELIGIBLE FORECAST PER DELIVERY INTERVAL")
    print("=" * 70)

    for (start_time,) in delivery_intervals:
        result = get_latest_forecast(
            datetime.fromisoformat(
                start_time.replace("Z", "+00:00")
            ),
            decision_dt,
        )

        if result:
            print(
                f"{start_time}  →  "
                f"{result['publishTime']}  →  "
                f"{result['generation']} MW"
            )
        else:
            print(
                f"{start_time}  →  No forecast available"
            )

    print()


if __name__ == "__main__":
    main()