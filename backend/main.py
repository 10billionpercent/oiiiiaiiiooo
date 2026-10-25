from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import initialize_and_load
from routes.forecasts import router as forecasts_router
from routes.accuracy_data import router as accuracy_data_router
from routes.accuracy import router as accuracy_router


app = FastAPI(title="Yuragi Backend")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    initialize_and_load()


app.include_router(forecasts_router)
app.include_router(accuracy_data_router)
app.include_router(accuracy_router)


@app.get("/")
def root():
    return {"message": "Yuragi backend is running"}