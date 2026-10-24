import sqlite3
from pathlib import Path

from services.elexon import (
    fetch_wind_forecasts,
    fetch_actual_generation,
)


DB_PATH = Path(__file__).parent / "data" / "yuragi.db"


def get_connection():
    DB_PATH.parent.mkdir(exist_ok=True)
    return sqlite3.connect(DB_PATH)


def initialize_database():
    conn = get_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS wind_forecasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time TEXT NOT NULL,
            publish_time TEXT NOT NULL,
            generation REAL NOT NULL,
            UNIQUE(start_time, publish_time)
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS actual_generation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time TEXT NOT NULL,
            generation REAL NOT NULL,
            UNIQUE(start_time)
        )
    """)

    conn.commit()
    conn.close()


def database_has_data():
    conn = get_connection()

    forecast_count = conn.execute(
        "SELECT COUNT(*) FROM wind_forecasts"
    ).fetchone()[0]

    actual_count = conn.execute(
        "SELECT COUNT(*) FROM actual_generation"
    ).fetchone()[0]

    conn.close()

    return forecast_count > 0 and actual_count > 0


def load_elexon_data():
    print("Fetching WINDFOR data...")
    forecasts = fetch_wind_forecasts()

    print("Fetching FUELHH data...")
    actuals = fetch_actual_generation()

    conn = get_connection()

    for forecast in forecasts:
        conn.execute(
            """
            INSERT OR IGNORE INTO wind_forecasts
            (start_time, publish_time, generation)
            VALUES (?, ?, ?)
            """,
            (
                forecast["startTime"],
                forecast["publishTime"],
                forecast["generation"],
            ),
        )

    for actual in actuals:
        conn.execute(
            """
            INSERT OR IGNORE INTO actual_generation
            (start_time, generation)
            VALUES (?, ?)
            """,
            (
                actual["startTime"],
                actual["generation"],
            ),
        )

    conn.commit()
    conn.close()

    print("Elexon data stored locally.")


def initialize_and_load():
    initialize_database()

    if database_has_data():
        print("Local Elexon data found. Skipping API fetch.")
        return

    print("Local Elexon data not found. Loading from Elexon...")
    load_elexon_data()