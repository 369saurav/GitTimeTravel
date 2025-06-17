from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from urllib.parse import urlparse, parse_qs

# Add the current directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import your service classes directly
from service.time_travel_service import GitHubFileHistoryAPI
from config.logger import get_logger

logger = get_logger(__name__)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL and query parameters
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Github-Url')
        self.end_headers()
        
        try:
            # Get headers
            authorization = self.headers.get('Authorization', '')
            github_url = self.headers.get('Github-Url', '')
            raw = query_params.get('raw', ['false'])[0].lower() == 'true'
            
            if not authorization:
                response = {"error": "Authorization header required"}
                self.wfile.write(json.dumps(response).encode())
                return
                
            if not github_url:
                response = {"error": "Github-Url header required"}
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Extract token
            token = authorization.replace("Bearer ", "").strip()
            
            # Initialize the API
            api = GitHubFileHistoryAPI(token=token)
            
            # Get either raw or processed history
            if raw:
                logger.info("Returning raw history with patches")
                result = api.get_raw_history(github_url)
            else:
                logger.info("Returning processed history with structured changes")
                result = api.get_processed_history(github_url)
            
            # Send response
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            logger.error(f"Error fetching file history: {str(e)}")
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Github-Url')
        self.end_headers()
