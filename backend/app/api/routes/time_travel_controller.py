
from fastapi import APIRouter, Header

from app.config.logger import get_logger
from app.service.time_travel_service import fetch_commit_history_with_diffs


router = APIRouter()
logger = get_logger(__name__)


@router.get("/time-travel")
def get_all_data(
    # X_Access_Token: str = Header(..., description="Access token from request header"),
    # X_Github_Url: str = Header(..., description="Github URL from request header"),

):
    """
    Get all data from git repository.
    """
    logger.info("Fetching all data from git repository")
    commits = fetch_commit_history_with_diffs()
   
    return {"data": commits}