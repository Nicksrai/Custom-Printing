import sys
import os
from sqlalchemy import text

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.database import SessionLocal

def migrate():
    db = SessionLocal()
    try:
        # Check if column exists
        db.execute(text("ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS customization_details TEXT"))
        db.commit()
        print("Migration successful: Added customization_details to wishlist table.")
    except Exception as e:
        print(f"Migration error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
