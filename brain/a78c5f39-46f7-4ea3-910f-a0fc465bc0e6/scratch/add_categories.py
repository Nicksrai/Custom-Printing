import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.all_models import Category

def add_categories():
    db = SessionLocal()
    categories = [
        {"name": "Kids zone", "description": "Personalized gifts and products for children.", "image_url": "/uploads/kids_zone.jpg"},
        {"name": "Wall decorative", "description": "Custom wall art and frames.", "image_url": "/uploads/wall_decorative.jpg"},
        {"name": "Home decorative", "description": "Beautiful items to decorate your home.", "image_url": "/uploads/home_decorative.jpg"},
        {"name": "Fashion accessories", "description": "Customized t-shirts and more.", "image_url": "/uploads/fashion_accessories.jpg"},
        {"name": "Photo album and print", "description": "Preserve your memories in print.", "image_url": "/uploads/photo_album.jpg"},
        {"name": "Desk decorative", "description": "Personalized office and desk items.", "image_url": "/uploads/desk_decorative.jpg"},
    ]

    try:
        for cat_data in categories:
            existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not existing:
                cat = Category(**cat_data)
                db.add(cat)
                print(f"Added category: {cat_data['name']}")
            else:
                existing.image_url = cat_data["image_url"]
                print(f"Updated category: {cat_data['name']}")
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_categories()
