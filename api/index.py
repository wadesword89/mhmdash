from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from api.data_sources.prism_api import requestPrismDepthData
from api.data_sources.mhm_api import fetchMHMLevelData
from datetime import datetime

app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def mm_to_inches(mm):
    if mm is None:
        return None
    return round(mm / 25.4, 2)


@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}


# Get Flow Meter Depth Data (From PRISM API)
@app.post("/api/py/prism_depth")
async def prism_depth(request: Request):
    try:
        body = await request.json()
        startTime = body.get("startTime")
        endTime = body.get("endTime")
        locationId = body.get("locationId")
        # print(startTime, endTime, locationId)
        
        if not startTime or not endTime:
            raise HTTPException(
                status_code=400, detail="startTime and endTime are required"
            )
        
        result = requestPrismDepthData(startTime, endTime, locationId)

        if not result:
            raise HTTPException(status_code=404, detail="Data not found in PRISM API")
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get MHM Level Data (From MHM API)
@app.post("/api/py/mhm_level")
async def mhm_level(request: Request):
    try:
        body = await request.json()
        startTime = body.get("startTime")
        endTime = body.get("endTime")
        deviceId = body.get("deviceId")

        if not startTime or not endTime:
            raise HTTPException(
                status_code=400, detail="startTime and endTime are required"
            )
        data = fetchMHMLevelData(startTime, endTime, deviceId)

        # Convert level to inches
        series = [
            {"t": p["t"], "levelIn": mm_to_inches(p["levelMm"])}
            for p in data["measurements"]
            if p.get("levelMm") is not None
        ]

        result = {
            "deviceId": data["deviceId"],
            "coordinates": data["coordinates"],
            "maxDistanceIn": mm_to_inches(data["maxDistanceMm"]),
            "lastWaterLevelIn": mm_to_inches(data["lastWaterLevelMm"]),
            "lastFillPercent": data["lastFillPercent"],
            "window": data["window"],
            "timeSeries": series,
        }
        # print("data from mhm api:", result)
        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
