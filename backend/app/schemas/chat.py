# app/schemas/chat.py
from pydantic import BaseModel
from datetime import datetime

# What React will send us (just the message)
class ChatCreate(BaseModel):
    message: str

# What we will send back to React (the full database row)
class ChatResponse(BaseModel):
    id: int
    user_id: int
    user_message: str
    ai_response: str
    created_at: datetime

    class Config:
        from_attributes = True