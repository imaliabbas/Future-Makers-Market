from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    MONGODB_URI: str
    DB_NAME: str = "glowing_chinchilla"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5137",
        "http://localhost:5138",
        "http://localhost:5139",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5137",
        "http://127.0.0.1:5138",
        "http://127.0.0.1:5139"
    ]
    SECRET_KEY: str = "your-secret-key-here" # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()