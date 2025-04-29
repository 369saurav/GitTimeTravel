from fastapi import APIRouter, Header, Query
from typing import Optional
from app.config.logger import get_logger
from app.service.time_travel_service import GitHubFileHistoryAPI

router = APIRouter()
logger = get_logger(__name__)


@router.get("/")
def read_root():
    return {"message": "MEOW! FROM GIT TIME TRAVEL."}


@router.get("/time-travel")
def get_file_history(
    Authorization: str = Header(..., description="Access token from request header"),
    Github_Url: str = Header(..., alias="Github-Url", description="Github URL from request header"),
    raw: Optional[bool] = Query(False, description="If true, return raw patches instead of structured changes")
):
    """
    Get file history from GitHub repository with structured changes for time travel visualization.
    
    Returns either:
    - Processed history with structured changes (default)
    - Raw history with original diff patches (if raw=True)
    """
    logger.info(f"Fetching file history for URL: {Github_Url}")
    
    # Extract token (commented out for security - using hardcoded token in example)
    token = Authorization.replace("Bearer ", "").strip()
    
    try:
        # Initialize the API
        api = GitHubFileHistoryAPI(token=token)
        
        # Get either raw or processed history
        if raw:
            logger.info("Returning raw history with patches")
            return api.get_raw_history(Github_Url)
        else:
            logger.info("Returning processed history with structured changes")
            return api.get_processed_history(Github_Url)
            
    except Exception as e:
        logger.error(f"Error fetching file history: {str(e)}")
        return {"error": str(e)}, 500