
from fastapi import APIRouter

from app.config.logger import get_logger


router = APIRouter()
logger = get_logger(__name__)


@router.get("/time-travel")
def get_all_data():
    """
    Get all data from git repository.
    """
    logger.info("Fetching all data from git repository")
   
    return {"message": "Fetched all data from git repository"}