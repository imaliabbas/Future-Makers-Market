from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

# Create a global client instance
client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
db = client[settings.DB_NAME]