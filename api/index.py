import sys
import os

# Add the parent directory to sys.path to allow imports from the backend package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app from the backend
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))
from main import app

# Re-export the FastAPI app for Vercel serverless functions
# Vercel uses this as the handler
handler = app
