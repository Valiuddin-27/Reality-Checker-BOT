# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# 1. Incoming Data (What the user sends when signing up)
class UserCreate(BaseModel):
    email: EmailStr
    # We use Field to ensure the password is at least 8 chars, and max 72 chars.
    password: str = Field(..., min_length=8, max_length=72)

# 2. Outgoing Data (What we send back to the React app)
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True