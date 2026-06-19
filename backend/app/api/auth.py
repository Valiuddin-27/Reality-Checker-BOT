# backend/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.all_models import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token
from app.core.security import get_password_hash, verify_password, create_access_token

# An APIRouter allows us to group multiple routes together 
# instead of dumping everything into main.py
router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user into the database."""
    
    # 1. Check if the email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 2. Hash the password before saving
    hashed_pwd = get_password_hash(user.password)
    
    # 3. Create the Database Model
    new_user = User(email=user.email, password_hash=hashed_pwd)
    
    # 4. Save to Database
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # Fetches the newly generated ID from Postgres
    
    # Returns the user data (FastAPI automatically uses UserResponse to hide the password)
    return new_user


@router.post("/login", response_model=Token)
def login(user_credentials: UserCreate, db: Session = Depends(get_db)):
    """Authenticates a user and returns a JWT."""
    
    # 1. Find the user by email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    # 2. If user doesn't exist OR passwords don't match, reject them.
    # Notice we give the exact same generic error message for both to prevent 
    # hackers from guessing which emails exist in our system.
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # 3. Create the VIP Wristband (JWT) containing their database ID
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {"access_token": access_token, "token_type": "bearer"}