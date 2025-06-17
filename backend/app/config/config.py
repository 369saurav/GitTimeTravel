from dotenv import load_dotenv
import os

# Only load .env file in development, not in Vercel environment
if os.environ.get("VERCEL_ENV") is None:
    load_dotenv()  # Load .env file