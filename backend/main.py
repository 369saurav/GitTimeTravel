
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.time_travel_controller import router as time_travel_router
from app.config.logger import get_logger


app = FastAPI(title="Git Time Travel API")

# Add CORS middleware for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = get_logger(__name__)
app.include_router(time_travel_router, prefix="/api")