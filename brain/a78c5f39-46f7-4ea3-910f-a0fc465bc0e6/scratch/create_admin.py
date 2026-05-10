import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.all_models import User, RoleEnum
from app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    admin_email = "admin@printhub.com"
    admin_password = "admin123"
    
    try:
        existing = db.query(User).filter(User.email == admin_email).first()
        if not existing:
            hashed_pw = get_password_hash(admin_password)
            new_admin = User(
                name="System Admin",
                email=admin_email,
                hashed_password=hashed_pw,
                role=RoleEnum.admin
            )
            db.add(new_admin)
            db.commit()
            print(f"Admin created successfully!")
            print(f"Email: {admin_email}")
            print(f"Password: {admin_password}")
        else:
            print(f"Admin already exists with email: {admin_email}")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
