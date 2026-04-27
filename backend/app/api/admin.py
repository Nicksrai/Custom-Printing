from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db
from app.models.all_models import Order, User, Product, ContactMessage, OrderItem, Payment, Offer, CartItem
from app.core.security import get_current_admin, get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

# ===== Pydantic Schemas =====
class OfferCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    discount_text: Optional[str] = None
    end_date: str  # ISO format datetime string
    banner_image_url: Optional[str] = None
    is_active: bool = True

# ===== Dashboard =====
@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    total_sales = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    total_orders = db.query(func.count(Order.id)).scalar()
    total_users = db.query(func.count(User.id)).filter(User.role == 'user').scalar()
    total_products = db.query(func.count(Product.id)).scalar()
    pending_orders = db.query(func.count(Order.id)).filter(Order.status == 'pending').scalar()
    recent_messages = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).limit(5).all()

    return {
        "total_sales": total_sales,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_products": total_products,
        "pending_orders": pending_orders,
        "recent_messages": recent_messages
    }

# ===== Orders =====
@router.get("/orders")
def get_all_orders(db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    orders = db.query(Order).options(
        joinedload(Order.user),
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.payment)
    ).order_by(Order.created_at.desc()).all()

    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "customer_name": order.user.name if order.user else "N/A",
            "customer_email": order.user.email if order.user else "N/A",
            "total_amount": order.total_amount,
            "status": order.status.value if order.status else "pending",
            "shipping_address": order.shipping_address,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "payment_status": order.payment.status.value if order.payment else "unpaid",
            "items": [
                {
                    "product_name": item.product.name if item.product else "Deleted Product",
                    "quantity": item.quantity,
                    "price": item.price,
                    "customization": item.customization_details
                }
                for item in order.items
            ]
        })
    return result

@router.put("/orders/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    return {"message": f"Order #{order_id} status updated to {status}"}

# ===== Users =====
@router.get("/users")
def get_all_users(db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        order_count = db.query(func.count(Order.id)).filter(Order.user_id == u.id).scalar()
        total_spent = db.query(func.sum(Order.total_amount)).filter(Order.user_id == u.id).scalar() or 0.0
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "order_count": order_count,
            "total_spent": total_spent
        })
    return result

# ===== Offers (Admin CRUD) =====
@router.post("/offers")
def create_offer(offer: OfferCreate, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    db_offer = Offer(
        title=offer.title,
        subtitle=offer.subtitle,
        discount_text=offer.discount_text,
        end_date=datetime.fromisoformat(offer.end_date),
        banner_image_url=offer.banner_image_url,
        is_active=offer.is_active
    )
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return {"id": db_offer.id, "message": "Offer created"}

@router.get("/offers")
def get_all_offers(db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    offers = db.query(Offer).order_by(Offer.created_at.desc()).all()
    return [{
        "id": o.id,
        "title": o.title,
        "subtitle": o.subtitle,
        "discount_text": o.discount_text,
        "end_date": o.end_date.isoformat() if o.end_date else None,
        "banner_image_url": o.banner_image_url,
        "is_active": o.is_active
    } for o in offers]

@router.delete("/offers/{offer_id}")
def delete_offer(offer_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    db.delete(offer)
    db.commit()
    return {"message": "Offer deleted"}

# ===== Public: Active Offer (no auth needed) =====
# This is placed here but exposed via a separate public router below

# ===== Cart count (for logged-in user) =====
@router.get("/cart-count")
def get_cart_count(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    count = db.query(func.count(CartItem.id)).filter(CartItem.user_id == current_user.id).scalar()
    return {"count": count}

@router.get("/wishlist-count")
def get_wishlist_count(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from app.models.all_models import Wishlist
    count = db.query(func.count(Wishlist.id)).filter(Wishlist.user_id == current_user.id).scalar()
    return {"count": count}

# ===== User Order History =====
@router.get("/my-orders")
def get_my_orders(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    orders = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.payment)
    ).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()

    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status.value if order.status else "pending",
            "shipping_address": order.shipping_address,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "payment_status": order.payment.status.value if order.payment else "unpaid",
            "items": [
                {
                    "product_name": item.product.name if item.product else "Deleted",
                    "quantity": item.quantity,
                    "price": item.price,
                }
                for item in order.items
            ]
        })
    return result
