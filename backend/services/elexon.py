import requests

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"


def fetch_wind_forecasts():
    url = f"{BASE_URL}/WINDFOR/stream"

    params = {
        "publishDateTimeFrom": "2025-12-31T00:00:00Z",
        "publishDateTimeTo": "2026-01-30T23:59:59Z",
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    return response.json()


def fetch_actual_generation():
    url = f"{BASE_URL}/FUELHH/stream"

    params = {
        "settlementDateFrom": "2026-01-01",
        "settlementDateTo": "2026-01-31",
        "fuelType": "WIND",
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    return response.json()