from fastapi import FastAPI

from database import initialize_and_load
from routes.forecasts import router as forecasts_router
from routes.accuracy import router as accuracy_router


app = FastAPI(title="Yuragi Backend")


@app.on_event("startup")
def startup():
    initialize_and_load()


app.include_router(forecasts_router)
app.include_router(accuracy_router)


@app.get("/")
def root():
    return {"message": "Yuragi backend is running"}