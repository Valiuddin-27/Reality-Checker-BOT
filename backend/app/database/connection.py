import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load local .env file if it exists
load_dotenv()

# 1. Get the URL from the Environment Variables
DATABASE_URL = os.getenv("DATABASE_URL")

# 2. Safety Check: If it's completely missing, fall back to a local database so it doesn't crash
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./sql_app.db"

# 3. SQLAlchemy 2.0 Fix: Force the URL to use 'postgresql://' instead of 'postgres://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SQLALCHEMY_DATABASE_URL = DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()