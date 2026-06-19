# app/models/chat.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base # <-- Update this line if your Base is stored elsewhere!

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    # We link every message to a specific user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False) 
    
    # We store what the user said, and what Gemini replied
    user_message = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Optional: Creates a link back to the User model
    owner = relationship("User")