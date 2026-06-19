from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, chat

# --- FIX: Import both engine and Base from your connection file ---
from app.database.connection import engine, Base

# This line stays exactly the same:
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Human API", version="1.0.0")

origins = [
    "http://localhost:5173", # Your local laptop
    "https://reality-checker-bot-dg8u.vercel.app" # Your live Vercel link!
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing Auth Router
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# NEW Chat Router
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])

@app.get("/")
async def root():
    return {"status": "online", "message": "Welcome to The Human API Backend"}