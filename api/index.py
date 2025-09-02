from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from api.data_sources.prism_api import requestPrismDepthData
# from api.data_sources.mhm_api import requestMHMDepthData

app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}


# Get Flow Meter Data (From PRISM API)
@app.post("/api/py/prism_api")
async def prism_api(request: Request):
    try:
        body = await request.json()
        startTime = body.get("startTime")
        endTime = body.get("endTime")

        if not startTime or not endTime:
            raise HTTPException(
                status_code=400, detail="startTime and endTime are required"
            )

        # PRISM DATA
        result = requestPrismDepthData(startTime, endTime)

        if not result:
            raise HTTPException(status_code=404, detail="Data not found in PRISM API")
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/py/mhm_api")
async def mhm_api(request: Request):
    try:
        body = await request.json()
        startTime = body.get("startTime")
        endTime = body.get("endTime")

        if not startTime or not endTime:
            raise HTTPException(
                status_code=400, detail="startTime and endTime are required"
            )

        # result = await requestMHMDepthData(startTime, endTime)

        # if not result or not result.get("devices"):
        #     raise HTTPException(
        #         status_code=404, detail="No MHM data in specified window"
        #     )
        # return result
    
    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
