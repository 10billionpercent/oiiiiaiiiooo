from collections import defaultdict

from database import get_connection


def get_actual_generation(delivery_date: str):
    conn = get_connection()

    actuals = conn.execute(
        """
        SELECT
            start_time,
            generation
        FROM actual_generation
        WHERE start_time LIKE ?
        ORDER BY start_time
        """,
        (f"{delivery_date}T%",),
    ).fetchall()

    conn.close()

    hourly = defaultdict(list)

    for start_time, generation in actuals:
        hour = start_time[:13]
        hourly[hour].append(generation)

    return [
        {
            "startTime": f"{hour}:00:00Z",
            "generation": sum(values) / len(values),
        }
        for hour, values in sorted(hourly.items())
    ]