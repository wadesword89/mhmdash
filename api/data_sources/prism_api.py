import requests
from dotenv import load_dotenv
import os

load_dotenv()


def requestPrismDepthData(startTime: str, endTime: str, locationId: int):
    """
    Fetch FM depth data from ADS PRISM API.

    Args:
        startTime: ISO 8601 formatted datetime string (e.g. '2025-03-01T00:00:00')
        endTime: ISO 8601 formatted datetime string (e.g. '2025-03-01T23:59:59')
        locationId: Integer representing the location ID (which is id of the FM device) to fetch data for
    Returns:
        Dict containing the API response data"
    """

    startArr = startTime.split(":")
    endArr = endTime.split(":")
    PRISM_API_TOKEN = os.getenv("NEXT_PUBLIC_PRISM_API_TOKEN")

    headers = {
        "accept": "text/plain",
        "x-ads-dev": PRISM_API_TOKEN,  # API key for FY2425 data
    }

    entityId = 4122  # Use 4122 to get DEPTH, or 4405 to get WATERTEMP_1

    # locationId: 2 -> 7 = "ALB_0212A_001" -> "ALB_0212A_006"

    url = f"https://api.adsprism.com/api/Telemetry?locationId=2&locationId={locationId}&entityId={entityId}&start={startArr[0]}%3A{startArr[1]}%3A{startArr[2]}&end={endArr[0]}%3A{endArr[1]}%3A{endArr[2]}"

    response = requests.get(url, headers=headers)
    data = response.json()
    # print("data from prism api:", data)
    return data


# start = '2025-09-08T00:00:00'
# end = '2025-09-08T00:59:59'
# locationId = 2
# result = requestPrismDepthData(start, end, locationId)
# print(result)


def requestPrismTempData(startTime: str, endTime: str):
    """
    Fetch FM wastewater temp data from ADS PRISM API.

    Args:
        startTime: ISO 8601 formatted datetime string (e.g. '2025-03-01T00:00:00')
        endTime: ISO 8601 formatted datetime string (e.g. '2025-03-01T23:59:59')

    Returns:
        Dict containing the API response data"
    """

    startArr = startTime.split(":")
    endArr = endTime.split(":")

    headers = {
        "accept": "text/plain",
        "x-ads-dev": "pN64fDCNXfEWHgj8+KPRp7QPoJIPM2ONcOjPo92EoQI=",  # API key for FY2425 data
    }

    entityId = 4405  # Use 4122 to get DEPTH, or 4405 to get WATERTEMP_1

    # locationId: 2 -> 7 = "ALB_0212A_001" -> "ALB_0212A_006"

    url = f"https://api.adsprism.com/api/Telemetry?locationId=2&locationId=3&locationId=4&locationId=5&locationId=6&locationId=7&entityId={entityId}&start={startArr[0]}%3A{startArr[1]}%3A{startArr[2]}&end={endArr[0]}%3A{endArr[1]}%3A{endArr[2]}"

    response = requests.get(url, headers=headers)
    data = response.json()

    return data


# start = '2025-03-01T00:00:00'
# end = '2025-03-01T23:59:59'
# result = requestPrismTempData(start, end)
# print(result)


def requestPrismRainData(startTime: str, endTime: str):
    """
    Fetch Rain Guage 11 data from ADS PRISM API.

    Args:
        startTime: ISO 8601 formatted datetime string (e.g. '2025-03-01T00:00:00')
        endTime: ISO 8601 formatted datetime string (e.g. '2025-03-01T23:59:59')

    Returns:
        Dict containing the API response data"
    """

    startArr = startTime.split(":")
    endArr = endTime.split(":")
    entityId = 2123  # RAIN
    locationId = 22  # RG11

    headers = {
        "accept": "text/plain",
        "x-ads-dev": "9vRkqNrr9PmloH8pEGcwj70e8OXsoZ/Nhd+EC8zzp9o=",  # API key for FY2425 data
    }

    rainUrl = f"https://api.adsprism.com/api/Telemetry?locationId={locationId}&entityId={entityId}&start={startArr[0]}%3A{startArr[1]}%3A{startArr[2]}&end={endArr[0]}%3A{endArr[1]}%3A{endArr[2]}"

    response = requests.get(rainUrl, headers=headers)
    data = response.json()

    return data


# start = '2025-03-01T00:00:00'
# end = '2025-03-01T23:59:59'
# result = requestPrismRainData(start, end)
# print(result)
