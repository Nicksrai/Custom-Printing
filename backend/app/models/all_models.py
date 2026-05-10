from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base

class RoleEnum(str, enum.Enum):
    user = "user"
    admin = "admin"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"

class OrderStatus(str, enum.Enum):
    new = "New"
    designing = "Designing"
    printing = "Printing"
    ready = "Ready"
    delivered = "Delivered"
    cancelled = "Cancelled"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.user)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    base_price = Column(Float, nullable=False)
    features = Column(Text, nullable=True) # Could be JSON or newline separated
    image_url = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    is_customizable = Column(Boolean, default=True)

    category = relationship("Category", back_populates="products")
    customization_options = relationship("ProductCustomization", back_populates="product")
    stock_management = relationship("StockManagement", back_populates="product", uselist=False)

class ProductCustomization(Base):
    __tablename__ = "product_customizations"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    customization_type = Column(String(50)) # e.g., 'color', 'size', 'style'
    option_value = Column(String(100)) # e.g., 'Red', 'XL', 'Matte'
    price_modifier = Column(Float, default=0.0) # Additional cost

    product = relationship("Product", back_populates="customization_options")

class CartItem(Base):
    __tablename__ = "cart"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    customization_details = Column(Text, nullable=True) # JSON literal of chosen colors, sizes, uploaded file path
    total_price = Column(Float, nullable=False)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.new)
    shipping_address = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    payment = relationship("Payment", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False) # Price at time of order
    customization_details = Column(Text, nullable=True) # Chosen colors, image paths

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    amount = Column(Float, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    transaction_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payment")

class ContactMessage(Base):
    __tablename__ = "contact_messages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class StockManagement(Base):
    __tablename__ = "stock_management"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True)
    quantity = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="stock_management")

class Offer(Base):
    __tablename__ = "offers"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(200), nullable=True)
    discount_text = Column(String(100), nullable=True)
    end_date = Column(DateTime, nullable=False)
    banner_image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Wishlist(Base):
    __tablename__ = "wishlist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    customization_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    product = relationship("Product")

class CustomerRequirement(Base):
    __tablename__ = "customer_requirements"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), nullable=False)
    product_category = Column(String(100), nullable=False)
    color = Column(String(50), nullable=True)
    quantity = Column(Integer, default=1)
    notes = Column(Text, nullable=True)
    custom_text = Column(String(200), nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.new)
    created_at = Column(DateTime, default=datetime.utcnow)
