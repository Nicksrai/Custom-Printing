from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.product import ProductResponse

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1
    customization_details: Optional[str] = None # JSON string

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: int
    user_id: int
    total_price: float
    product: ProductResponse

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float
    customization_details: Optional[str] = None

class OrderItemResponse(OrderItemBase):
    id: int
    product: ProductResponse

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    shipping_address: str
    
class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: int
    user_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class PaymentIntentResponse(BaseModel):
    client_secret: str
    order_id: int
