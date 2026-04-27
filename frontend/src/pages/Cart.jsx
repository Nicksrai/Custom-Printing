import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMode, setPaymentMode] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [processing, setProcessing] = useState(false);
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

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const handleInitiateCheckout = () => {
        if (!shippingAddress.trim()) {
            alert('Please enter a shipping address');
            return;
        }
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = async () => {
        if (!paymentMode) {
            alert('Please select a payment method.');
            return;
        }
        setProcessing(true);
        try {
            const res = await api.post('/orders/checkout', { shipping_address: shippingAddress });
            const orderId = res.data.order_id;

            // Simulate Payment Success
            await api.post(`/orders/payment-success?order_id=${orderId}`);

            // Generate receipt data
            setReceiptData({
                orderId: orderId,
                date: new Date().toLocaleString(),
                items: cartItems.map(item => ({
                    name: item.product?.name || 'Product',
                    qty: item.quantity,
                    price: item.total_price,
                    customization: item.customization_details ? JSON.parse(item.customization_details) : null
                })),
                subtotal: totalAmount,
                shipping: 0,
                total: totalAmount,
                paymentMode: paymentMode,
                shippingAddress: shippingAddress,
                customerEmail: user?.email || 'N/A',
                transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`
            });

            setShowPaymentModal(false);
            setShowReceipt(true);
        } catch (err) {
            alert('Checkout failed: ' + (err.response?.data?.detail || err.message));
        } finally {
            setProcessing(false);
        }
    };

    const handlePrintReceipt = () => {
        const printContent = receiptRef.current;
        const win = window.open('', '', 'width=800,height=600');
        win.document.write(`
            <html><head><title>Receipt - Order #${receiptData.orderId}</title>
            <style>
                body { font-family: 'Montserrat', sans-serif; padding: 40px; color: #111; }
                .receipt-header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 20px; }
                .receipt-header h1 { font-size: 28px; margin: 0; }
                .receipt-header p { color: #666; margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                th { font-weight: 600; color: #374151; font-size: 13px; text-transform: uppercase; }
                .totals { margin-top: 20px; text-align: right; }
                .totals .row { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 8px; }
                .totals .total-row { font-size: 18px; font-weight: 800; border-top: 2px solid #111; padding-top: 10px; }
                .meta { margin-top: 30px; font-size: 13px; color: #666; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 15px; }
            </style></head><body>
            ${printContent.innerHTML}
            </body></html>
        `);
        win.document.close();
        win.print();
    };

    const totalAmount = cartItems.reduce((acc, item) => acc + item.total_price, 0);

    if (loading) return <div className="loading-cart">Loading your cart...</div>;

    // Show Receipt View
    if (showReceipt && receiptData) {
        return (
            <div className="cart-container">
                <div className="receipt-wrapper">
                    <div className="receipt-card" ref={receiptRef}>
                        <div className="receipt-header">
                            <h1 className="cursive-font">Custom Wears</h1>
                            <p>Order Confirmation & Receipt</p>
                        </div>

                        <div className="receipt-meta-grid">
                            <div>
                                <strong>Order ID</strong>
                                <p>#{receiptData.orderId}</p>
                            </div>
                            <div>
                                <strong>Date</strong>
                                <p>{receiptData.date}</p>
                            </div>
                            <div>
                                <strong>Transaction ID</strong>
                                <p>{receiptData.transactionId}</p>
                            </div>
                            <div>
                                <strong>Payment Method</strong>
                                <p>{receiptData.paymentMode}</p>
                            </div>
                        </div>

                        <table className="receipt-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receiptData.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            {item.name}
                                            {item.customization?.text && <span className="custom-note"> (Text: {item.customization.text})</span>}
                                        </td>
                                        <td>{item.qty}</td>
                                        <td>${item.price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="receipt-totals">
                            <div className="totals-row"><span>Subtotal</span><span>${receiptData.subtotal.toFixed(2)}</span></div>
                            <div className="totals-row"><span>Shipping</span><span>Free</span></div>
                            <div className="totals-row total-final"><span>Total</span><span>${receiptData.total.toFixed(2)}</span></div>
                        </div>

                        <div className="receipt-address">
                            <strong>Shipping to:</strong>
                            <p>{receiptData.shippingAddress}</p>
                        </div>

                        <div className="receipt-footer">
                            Thank you for shopping with Custom Wears! Your order is being processed.
                        </div>
                    </div>

                    <div className="receipt-actions">
                        <button className="btn-print" onClick={handlePrintReceipt}>🖨️ Print Receipt</button>
                        <button className="btn-continue" onClick={() => navigate('/')}>Continue Shopping</button>
                    </div>
                </div>
            </div>
        );
    }

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
                                        <h3>{item.product?.name || 'Product'}</h3>
                                        <p>Qty: {item.quantity}</p>
                                        {customInfo.text && <p>Custom Text: {customInfo.text}</p>}
                                        {customInfo.uploadedDesign && <p>Design Uploaded ✅</p>}
                                        <p className="item-price">${item.total_price.toFixed(2)}</p>
                                    </div>
                                    <button className="remove-btn" onClick={() => handleRemove(item.id)}>
                                        Remove
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="order-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        
                        <div className="shipping-form">
                            <label>Shipping Address</label>
                            <textarea 
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                placeholder="Enter full address..."
                                rows="3"
                            ></textarea>
                        </div>
                        
                        <button className="checkout-btn" onClick={handleInitiateCheckout}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Mode Modal */}
            {showPaymentModal && (
                <div className="modal-overlay">
                    <div className="payment-modal">
                        <h3>Select Payment Method</h3>
                        <div className="payment-options">
                            {['Credit Card', 'Debit Card', 'PayPal', 'UPI', 'Bank Transfer', 'Cash on Delivery'].map(mode => (
                                <label key={mode} className={`payment-option ${paymentMode === mode ? 'selected' : ''}`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value={mode} 
                                        checked={paymentMode === mode}
                                        onChange={() => setPaymentMode(mode)} 
                                    />
                                    <span className="payment-label">{mode}</span>
                                </label>
                            ))}
                        </div>

                        <div className="order-review">
                            <h4>Order Review</h4>
                            <p>{cartItems.length} item(s) — <strong>${totalAmount.toFixed(2)}</strong></p>
                            <p className="address-preview">📍 {shippingAddress}</p>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleConfirmPayment} disabled={processing}>
                                {processing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
