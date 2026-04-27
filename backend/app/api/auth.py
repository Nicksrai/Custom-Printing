from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import User, RoleEnum
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from datetime import timedelta
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    # Default is normal user, admin can be created through other secure methods or manually first time
    db_user = User(name=user.name, email=user.email, hashed_password=hashed_password, role=RoleEnum.user)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/setup-admin", response_model=UserResponse)
def setup_admin(user: UserCreate, db: Session = Depends(get_db)):
    # Security check: only allow if NO users currently exist (or no admin)
    # Alternatively, just allow creating admin if it's the first user ever
    admin_exists = db.query(User).filter(User.role == RoleEnum.admin).first()
    if admin_exists:
        raise HTTPException(status_code=400, detail="An admin already exists")
    
    hashed_password = get_password_hash(user.password)
    db_admin = User(name=user.name, email=user.email, hashed_password=hashed_password, role=RoleEnum.admin)
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

@router.post("/login", response_model=Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.username).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
