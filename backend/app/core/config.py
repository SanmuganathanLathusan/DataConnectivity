import os
from pydantic_settings import BaseSettings
from typing import List
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the backend directory
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

print(f"--- Loading Configuration ---")
print(f"Env Path: {env_path}")
print(f"Env Exists: {env_path.exists()}")
print(f"MONGO_URI from Env: {os.getenv('MONGO_URI')[:30] if os.getenv('MONGO_URI') else 'None'}...")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Data Connectivity & Transfer Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # MongoDB Atlas
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "datafly")

    # Encryption key for DB passwords
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "32-byte-base64-encoded-key-here")

    # Email Settings
    EMAIL_USER: str = os.getenv("EMAIL_USER", "")
    EMAIL_PASS: str = os.getenv("EMAIL_PASS", "")

    # Google Auth Settings
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")

    # Frontend URL for reset links
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        case_sensitive = True

settings = Settings()
