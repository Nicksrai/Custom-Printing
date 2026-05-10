from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from uuid import uuid4

from app.db.database import get_db
from app.models.all_models import Product, Category, ProductCustomization, Wishlist
from app.schemas.product import ProductCreate, ProductResponse, CategoryCreate, CategoryResponse, WishlistResponse
from app.core.security import get_current_admin, get_current_user

router = APIRouter(prefix="/api/products", tags=["products"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Categories
@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Products
@router.get("/", response_model=List[ProductResponse])
def get_products(category_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    return query.all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    product_data = product.model_dump(exclude={"customizations"})
    db_product = Product(**product_data)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    if product.customizations:
        for cust in product.customizations:
            db_cust = ProductCustomization(**cust.model_dump(), product_id=db_product.id)
            db.add(db_cust)
        db.commit()
        db.refresh(db_product)
        
    return db_product

# Upload custom design endpoint
@router.post("/upload-design")
def upload_custom_design(file: UploadFile = File(...)):
    # In production, check file type/size, or upload to S3
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid4()}.{file_ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"filename": filename, "url": f"/{UPLOAD_DIR}/{filename}"}

# Wishlist
@router.get("/wishlist/all", response_model=List[WishlistResponse])
def get_wishlist(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()

@router.post("/wishlist/{product_id}")
def add_to_wishlist(product_id: int, customization: Optional[str] = None, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Check if exists with SAME customization? 
    # Usually users might want to save different customizations, but for now let's just update if exists
    existing = db.query(Wishlist).filter(Wishlist.user_id == current_user.id, Wishlist.product_id == product_id).first()
    if existing:
        existing.customization_details = customization
        db.commit()
        return {"message": "Wishlist updated"}
    
    db_item = Wishlist(user_id=current_user.id, product_id=product_id, customization_details=customization)
    db.add(db_item)
    db.commit()
    return {"message": "Added to wishlist"}

@router.delete("/wishlist/{product_id}")
def remove_from_wishlist(product_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db.query(Wishlist).filter(Wishlist.user_id == current_user.id, Wishlist.product_id == product_id).delete()
    db.commit()
    return {"message": "Removed from wishlist"}
