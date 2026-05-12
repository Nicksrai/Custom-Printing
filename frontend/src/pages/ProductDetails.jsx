import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './ProductDetails.css';
import { Heart } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [customization, setCustomization] = useState({ text: '', printSide: 'Front', color: '#ffffff' });
    const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                console.error("Error fetching product", err);
            }
        };
        fetchProduct();
    }, [id]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        try {
            const res = await api.post('/products/upload-design', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadedFileUrl(res.data.url);
        } catch (err) {
            alert('File upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        const detailsStr = JSON.stringify({
            text: customization.text,
            uploadedDesign: uploadedFileUrl,
            options: customization.details
        });

        try {
            await api.post('/orders/cart', {
                product_id: parseInt(id),
                quantity: quantity,
                customization_details: detailsStr
            });
            window.dispatchEvent(new Event('cartUpdated'));
            alert('Added to cart!');
            navigate('/cart');
        } catch (err) {
            alert('Failed to add to cart: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleWishlist = async () => {
        if (!user) { navigate('/login'); return; }
        try {
            await api.post(`/products/wishlist/${id}?customization=${encodeURIComponent(JSON.stringify(customization))}`);
            window.dispatchEvent(new Event('wishlistUpdated'));
            alert('Added to Wishlist with customization!');
        } catch (err) {
            alert('Failed to add to wishlist');
        }
    };

    // Calculate dynamic price
    let currentPrice = product?.base_price || 0;
    // We would loop through customization.details to add price_modifiers here

    if (!product) return <div className="loading">Loading...</div>;

    return (
        <div className="product-details-container">
            <div className="product-detail-view">
                {/* Product Info Panel */}
                <div className="product-info-panel">
                    <h1>{product.name}</h1>
                    <p className="price">₹{(currentPrice * quantity).toFixed(2)}</p>
                    <p className="desc">{product.description}</p>
                    <p className="features">{product.features}</p>

                    {product.is_customizable && (
                        <div className="customization-engine">
                            <h3>Personalize It</h3>

                            <div className="form-group">
                                <label>Custom Text</label>
                                <input
                                    type="text"
                                    placeholder="Enter text to print"
                                    value={customization.text}
                                    onChange={(e) => setCustomization({ ...customization, text: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Base Color</label>
                                    <input type="color" className="color-picker" value={customization.color} onChange={e => setCustomization({ ...customization, color: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Print Side</label>
                                    <select value={customization.printSide} onChange={e => setCustomization({ ...customization, printSide: e.target.value })}>
                                        <option>Front</option>
                                        <option>Back</option>
                                        <option>Left Sleeve</option>
                                        <option>Right Sleeve</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Upload Custom Design (Image)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                {uploading && <span className="uploading-text">Uploading...</span>}
                            </div>
                        </div>
                    )}

                    <div className="actions">
                        <div className="quantity-control">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                        <button className="add-to-cart-btn" onClick={handleAddToCart}>
                            Add to Cart
                        </button>
                        <button className="buy-now-btn" onClick={() => {
                            if (!user) { navigate('/login'); return; }
                            const directItem = {
                                product_id: parseInt(id),
                                product_name: product.name,
                                quantity: quantity,
                                price: currentPrice,
                                customization_details: JSON.stringify({
                                    text: customization.text,
                                    color: customization.color,
                                    side: customization.printSide,
                                    uploadedDesign: uploadedFileUrl
                                })
                            };
                            navigate('/checkout', { state: { directItem } });
                        }}>
                            Buy Now
                        </button>
                        <button className="wishlist-action-btn" onClick={handleWishlist} title="Add to Wishlist">
                            <Heart size={20} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetails;
