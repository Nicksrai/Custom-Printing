import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import './Wishlist.css';

const Wishlist = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await api.get('/products/wishlist/all');
            setItems(res.data);
        } catch (err) {
            console.error("Failed to fetch wishlist");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await api.delete(`/products/wishlist/₹{productId}`);
            setItems(items.filter(item => item.product_id !== productId));
        } catch (err) {
            alert('Failed to remove item');
        }
    };

    const handleAddToCart = async (item) => {
        try {
            await api.post('/orders/cart', {
                product_id: item.product_id,
                quantity: 1,
                customization_details: item.customization_details || JSON.stringify({})
            });
            window.dispatchEvent(new Event('cartUpdated'));
            alert('Added to cart!');
        } catch (err) {
            navigate('/login');
        }
    };

    if (loading) return <div className="loading-screen">Loading wishlist...</div>;

    return (
        <div className="wishlist-page">
            <div className="container">
                <div className="wishlist-header">
                    <h1>My Wishlist</h1>
                    <p>{items.length} items saved for later</p>
                </div>

                {items.length === 0 ? (
                    <div className="empty-wishlist">
                        <Heart size={64} color="#d1d5db" />
                        <h3>Your wishlist is empty</h3>
                        <p>Browse our products and save your favorites!</p>
                        <Link to="/products" className="shop-btn">Continue Shopping</Link>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {items.map(item => (
                            <div key={item.id} className="wishlist-card">
                                <div className="wishlist-img" style={{ backgroundImage: `url(http://localhost:8000₹{item.product.image_url})` }}>
                                    <button className="remove-btn" onClick={() => handleRemove(item.product_id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="wishlist-info">
                                    <h3>{item.product.name}</h3>
                                    <div className="wishlist-meta">
                                        <p className="price">₹{item.product.base_price.toFixed(2)}</p>
                                        {item.customization_details && (
                                            <span className="cust-badge">Customized</span>
                                        )}
                                    </div>
                                    <div className="wishlist-actions">
                                        <Link to={`/product/₹{item.product_id}`} className="view-btn">View Details</Link>
                                        <button className="cart-btn" onClick={() => handleAddToCart(item)}>
                                            <ShoppingCart size={18} /> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
