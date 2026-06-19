from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from groq import Groq

# --- Database Tools ---
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import declarative_base
from app.database.connection import get_db, engine

Base = declarative_base()

class DBMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String)
    content = Column(Text)

Base.metadata.create_all(bind=engine)

load_dotenv(override=True)
router = APIRouter()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

# 🚨 UPGRADE 1: Tell the API to expect a "personality" from the frontend
class ChatRequest(BaseModel):
    message: str
    personality: str = "reality_checker" # Default fallback

# 🚨 UPGRADE 2: Define our AI Brains
PERSONALITIES = {
    "reality_checker": "You are 'Reality Checker', an analytical and helpful AI assistant. Always format your responses using strict Markdown. Use double newlines to separate paragraphs, and use standard dashes (-) for bullet points.",
    "sarcastic_dev": "You are a highly skilled but incredibly sarcastic senior software engineer. You are helpful, but you heavily mock the user for asking basic questions. Always format your responses using strict Markdown.",
    "pirate": "You are a helpful AI assistant, but you must speak entirely like a salty pirate. Use lots of pirate slang. Always format your responses using strict Markdown."
}

@router.get("/history")
@router.get("/history/")
def get_history(db: Session = Depends(get_db)):
    messages = db.query(DBMessage).order_by(DBMessage.id.asc()).all()
    return [{"role": msg.role, "content": msg.content} for msg in messages]

@router.post("/")
async def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)):
    if not client:
        raise HTTPException(status_code=500, detail="AI API key not configured.")
    
    user_msg = DBMessage(role="user", content=request.message)
    db.add(user_msg)
    db.commit()

    history = db.query(DBMessage).order_by(DBMessage.id.asc()).all()
    
    # 🚨 UPGRADE 3: Load the specific personality the user selected
    system_prompt = PERSONALITIES.get(request.personality, PERSONALITIES["reality_checker"])
    
    ai_messages = [{
        "role": "system", 
        "content": system_prompt
    }]
    
    for msg in history[-10:]:
        safe_role = "assistant" if msg.role == "bot" else msg.role
        ai_messages.append({"role": safe_role, "content": msg.content})

    try:
        def generate_stream():
            full_response = ""
            stream = client.chat.completions.create(
                messages=ai_messages,
                model="llama-3.1-8b-instant",
                stream=True,
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    word = chunk.choices[0].delta.content
                    full_response += word
                    yield word
            
            fresh_db = Session(bind=engine)
            try:
                ai_msg = DBMessage(role="assistant", content=full_response)
                fresh_db.add(ai_msg)
                fresh_db.commit()
            finally:
                fresh_db.close()

        return StreamingResponse(generate_stream(), media_type="text/plain")
        
    except Exception as e:
        print(f"AI Error: {e}") 
        raise HTTPException(status_code=500, detail="Failed to communicate with AI.")