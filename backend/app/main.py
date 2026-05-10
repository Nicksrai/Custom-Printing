from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.db.database import engine, Base
from app.models import all_models

# Create database tables
Base.metadata.create_all(bind=engine)

# Auto-migrate wishlist table
def migrate_db():
    from sqlalchemy import text
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        # PostgreSQL specific syntax to add column if not exists
        db.execute(text("ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS customization_details TEXT"))
        db.commit()
    except Exception as e:
        print(f"Migration warning: {e}")
    finally:
        db.close()

migrate_db()

# Auto-create default admin
def init_admin():
    from app.db.database import SessionLocal
    from app.models.all_models import User, RoleEnum
    from app.core.security import get_password_hash
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == RoleEnum.admin).first()
        if not admin:
            hashed_pw = get_password_hash("admin123")
            new_admin = User(
                name="Admin",
                email="admin@printhub.com",
                hashed_password=hashed_pw,
                role=RoleEnum.admin
            )
            db.add(new_admin)
            db.commit()
    finally:
        db.close()

init_admin()

app = FastAPI(
    title="Custom Printing API",
    description="Backend API for Custom Printing & Personalization Website",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import auth, products, orders, admin
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)

import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Custom Printing API"}

# Public: Get active offer (no auth required)
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import Offer
from fastapi import Depends
from datetime import datetime

@app.get("/api/offer/active")
def get_active_offer(db: Session = Depends(get_db)):
    offer = db.query(Offer).filter(Offer.is_active == True, Offer.end_date > datetime.utcnow()).order_by(Offer.end_date.asc()).first()
    if not offer:
        return None
    return {
        "id": offer.id,
        "title": offer.title,
        "subtitle": offer.subtitle,
        "discount_text": offer.discount_text,
        "end_date": offer.end_date.isoformat(),
        "banner_image_url": offer.banner_image_url
    }
