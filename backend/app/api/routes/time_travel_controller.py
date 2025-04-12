
from fastapi import APIRouter, Header

from app.config.logger import get_logger
from app.service.time_travel_service import fetch_commit_history_with_diffs


router = APIRouter()
logger = get_logger(__name__)


@router.get("/time-travel")
def get_all_data(
    Authorization: str = Header(..., description="Access token from request header"),
    Github_Url: str = Header(..., alias="Github-Url", description="Github URL from request header"),
):
    """
    Get all data from git repository.
    """
    logger.info("Fetching all data from git repository")

    # Remove "Bearer " prefix if present
    token = Authorization.replace("Bearer ", "").strip()

    commits = fetch_commit_history_with_diffs(Github_Url, token)
    return {"data": commits}
