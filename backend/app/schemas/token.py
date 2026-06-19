# backend/app/schemas/token.py
from pydantic import BaseModel

# The exact shape of the JSON Web Token we return upon successful login
class Token(BaseModel):
    access_token: str
    token_type: str