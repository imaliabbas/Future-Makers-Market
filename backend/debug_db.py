import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import sys

async def check_connection():
    print(f"Testing connection to: {settings.MONGODB_URI.split('@')[1] if '@' in settings.MONGODB_URI else 'Redacted'}")
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Force a connection verification
        await client.admin.command('ping')
        print("SUCCESS: Connected to MongoDB!")
    except Exception as e:
        print(f"ERROR: Failed to connect to MongoDB.\nDetails: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(check_connection())
    except Exception as e:
         print(f"Runtime Error: {e}")