
from fastapi import FastAPI
from app.api.routes.time_travel_controller import router as time_travel_router
from app.config.logger import get_logger


app = FastAPI(title="Project Dashboard API")
logger = get_logger(__name__)
app.include_router(time_travel_router)