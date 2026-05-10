from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        from_attributes = True

class ProductCustomizationBase(BaseModel):
    customization_type: str
    option_value: str
    price_modifier: float = 0.0

class ProductCustomizationCreate(ProductCustomizationBase):
    pass

class ProductCustomizationResponse(ProductCustomizationBase):
    id: int
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    base_price: float
    features: Optional[str] = None
    image_url: Optional[str] = None
    category_id: int
    is_customizable: bool = True

class ProductCreate(ProductBase):
    customizations: Optional[List[ProductCustomizationCreate]] = []

class ProductResponse(ProductBase):
    id: int
    customization_options: List[ProductCustomizationResponse] = []
    class Config:
        from_attributes = True

class WishlistResponse(BaseModel):
    id: int
    product_id: int
    customization_details: Optional[str] = None
    product: ProductResponse
    created_at: datetime
    class Config:
        from_attributes = True
