from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pymongo import MongoClient
from typing import Generator
from backend.config import settings

# PostgreSQL setup
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency for getting PostgreSQL database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# MongoDB setup
mongo_client = MongoClient(settings.MONGODB_URI)
mongo_db = mongo_client[settings.MONGODB_DB_NAME]


def get_mongo_db():
    """Get MongoDB database instance"""
    return mongo_db


# MongoDB collections
conversations_collection = mongo_db["conversations"]
customization_chats_collection = mongo_db["customization_chats"]
bot_analytics_collection = mongo_db["bot_analytics"]
