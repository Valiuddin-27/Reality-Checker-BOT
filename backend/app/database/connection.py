# backend/app/database/connection.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load variables from the .env file
load_dotenv()

# Get the URL, fallback to empty string if not found to prevent immediate crashes
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "")

# The Engine is the core interface to the database
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal is a factory that generates new database sessions for every request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the parent class for all our ORM models
Base = declarative_base()

# Dependency to safely open and close database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()