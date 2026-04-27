from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.all_models import CartItem, Product, Order, OrderItem, Payment, PaymentStatus
from app.schemas.order import CartItemCreate, CartItemResponse, OrderCreate, OrderResponse, PaymentIntentResponse
from app.core.security import get_current_user
import json

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.get("/cart", response_model=List[CartItemResponse])
def get_cart(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(CartItem).filter(CartItem.user_id == current_user.id).all()

@router.post("/cart", response_model=CartItemResponse)
def add_to_cart(cart_item: CartItemCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # In a real scenario, we'd parse customization_details to calculate exact additional price
    # Right now, returning base_price * quantity as temporary
    total_price = product.base_price * cart_item.quantity
    
    db_item = CartItem(
        user_id=current_user.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
        customization_details=cart_item.customization_details,
        total_price=total_price
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/cart/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Item removed"}

# Checkout flow
@router.post("/checkout", response_model=PaymentIntentResponse)
def checkout(order_data: OrderCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
        
    total_amount = sum([item.total_price for item in cart_items])
    
    # Create Order
    db_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        shipping_address=order_data.shipping_address
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Move Cart Items to Order Items
    for item in cart_items:
        order_item = OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.total_price / item.quantity,
            customization_details=item.customization_details
        )
        db.add(order_item)
    
    # Empty Cart
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    
    db.commit()
    
    # Simulate Returning Client Secret for dummy payment
    return {
        "client_secret": f"dummy_secret_for_order_{db_order.id}",
        "order_id": db_order.id
    }

@router.post("/payment-success")
def payment_success(order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    payment = Payment(
        order_id=order.id,
        amount=order.total_amount,
        status=PaymentStatus.completed,
        transaction_id="dummy_txn_12345"
    )
    db.add(payment)
    # Update order status in a real app
    
    db.commit()
    return {"message": "Payment successful and order placed"}

@router.get("/", response_model=List[OrderResponse])
def get_user_orders(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Order).filter(Order.user_id == current_user.id).all()
