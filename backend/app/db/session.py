from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client: AsyncIOMotorClient = None
db = None

def get_mongo_client() -> AsyncIOMotorClient:
    return client

def get_database():
    return db

async def connect_to_mongo():
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[settings.MONGO_DB_NAME]
        # Ping to verify connection
        await client.admin.command("ping")
        print(f"Connected to MongoDB Atlas - database: '{settings.MONGO_DB_NAME}'")
    except Exception as e:
        print(f"Failed to connect to MongoDB Atlas: {e}")
        raise

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")
