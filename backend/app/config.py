import os

from dotenv import load_dotenv

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "development")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://127.0.0.1:3000")
