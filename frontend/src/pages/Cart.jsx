import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Edit3, Check, X } from 'lucide-react';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const receiptRef = useRef();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await api.get('/orders/cart');
            setCartItems(res.data);
        } catch (err) {
            console.error("Failed to fetch cart", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (itemId) => {
        try {
            await api.delete(`/orders/cart/${itemId}`);
            fetchCart();
        } catch (err) {
            alert('Failed to remove item');
        }
    };

    const startEditing = (item) => {
        setEditingItem(item);
        setEditForm(item.customization_details ? JSON.parse(item.customization_details) : {});
    };

    const saveCustomization = async () => {
        try {
            await api.put(`/orders/cart/${editingItem.id}`, {
                product_id: editingItem.product_id,
                quantity: editingItem.quantity,
                customization_details: JSON.stringify(editForm)
            });
            setEditingItem(null);
            fetchCart();
            alert('Customization updated!');
        } catch (err) {
            alert('Failed to update customization');
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const totalAmount = cartItems.reduce((acc, item) => acc + item.total_price, 0);

    if (loading) return <div className="loading-cart">Loading your cart...</div>;

    return (
        <div className="cart-container">
            <h1>Your Shopping Cart</h1>
            
            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <p>Your cart is empty.</p>
                    <button className="btn-continue" onClick={() => navigate('/products')}>Browse Products</button>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-items">
                        {cartItems.map(item => {
                            const customInfo = item.customization_details ? JSON.parse(item.customization_details) : {};
                            const imgUrl = getImageUrl(item.product?.image_url);

                            return (
                                <div key={item.id} className="cart-item">
                                    <div className="item-img-placeholder">
                                        {imgUrl ? (
                                            <img src={imgUrl} alt={item.product?.name} />
                                        ) : (
                                            (item.product?.name || 'P').charAt(0)
                                        )}
                                    </div>
                                    <div className="item-details">
                                        <div className="item-title-row">
                                            <h3>{item.product?.name || 'Product'}</h3>
                                            {item.customization_details && <span className="cust-badge-small">Customized</span>}
                                        </div>
                                        <p className="item-qty">Qty: {item.quantity}</p>
                                        
                                        <div className="item-custom-summary">
                                            {customInfo.color && <span className="custom-tag">Color: {customInfo.color}</span>}
                                            {customInfo.side && <span className="custom-tag">Side: {customInfo.side}</span>}
                                            {customInfo.text && <p className="custom-text-prev">" {customInfo.text} "</p>}
                                            {customInfo.image && <span className="custom-tag">Design: Custom Uploaded</span>}
                                        </div>
                                        
                                        <p className="item-price">₹{item.total_price.toFixed(2)}</p>
                                    </div>
                                    <div className="item-actions-stack">
                                        <button className="edit-cust-btn" onClick={() => startEditing(item)}>
                                            <Edit3 size={16} /> Edit Design
                                        </button>
                                        <button className="remove-btn" onClick={() => handleRemove(item.id)}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="order-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                        
                        <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Customization Modal */}
            {editingItem && (
                <div className="modal-overlay">
                    <div className="edit-modal large-modal">
                        <div className="modal-header">
                            <h3>Customize: {editingItem.product.name}</h3>
                            <button className="close-x" onClick={() => setEditingItem(null)}><X /></button>
                        </div>
                        
                        <div className="edit-modal-body">
                            <div className="edit-controls">
                                <div className="control-group">
                                    <label>Pick Color</label>
                                    <div className="color-options-row">
                                        {['#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6366f1'].map(c => (
                                            <div 
                                                key={c} 
                                                className={`color-blob ${editForm.color === c ? 'active' : ''}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setEditForm({...editForm, color: c})}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="control-group">
                                    <label>Custom Text</label>
                                    <input 
                                        type="text" 
                                        value={editForm.text || ''} 
                                        onChange={(e) => setEditForm({...editForm, text: e.target.value})}
                                        placeholder="Type something..."
                                    />
                                </div>

                                <div className="control-group">
                                    <label>Reference Image / Sketch</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                const res = await api.post('/products/upload-design', formData);
                                                setEditForm({...editForm, image: res.data.url});
                                            }
                                        }}
                                    />
                                    {editForm.image && <p className="upload-success">Image uploaded successfully!</p>}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setEditingItem(null)}>Cancel</button>
                            <button className="btn-primary" onClick={saveCustomization}>
                                <Check size={18} /> Update Design
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
