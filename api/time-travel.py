import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

# Import your existing time travel router 
from fastapi import FastAPI, Request, Response
from app.api.routes.time_travel_controller import router as time_travel_router
from app.config.logger import get_logger

# Create a FastAPI app specifically for the time-travel endpoint
app = FastAPI()
logger = get_logger(__name__)

# Re-export all the routes from your original router
# This functions as a proxy to your existing API
app.include_router(time_travel_router)

# Handler for Vercel
handler = app
