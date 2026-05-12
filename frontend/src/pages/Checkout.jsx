import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, MapPin, CreditCard, ChevronLeft, Printer, CheckCircle } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const receiptRef = useRef();
    
    const [items, setItems] = useState([]);
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMode, setPaymentMode] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [loading, setLoading] = useState(true);

    const directItem = location.state?.directItem;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (directItem) {
            setItems([directItem]);
            setLoading(false);
        } else {
            fetchCart();
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await api.get('/orders/cart');
            setItems(res.data);
            if (res.data.length === 0) {
                navigate('/cart');
            }
        } catch (err) {
            console.error("Failed to fetch cart", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => {
            const price = directItem ? (item.price * item.quantity) : item.total_price;
            return acc + price;
        }, 0);
    };

    const handleConfirmOrder = async () => {
        if (!shippingAddress.trim()) {
            alert('Please enter a shipping address');
            return;
        }
        if (!paymentMode) {
            alert('Please select a payment method');
            return;
        }

        setProcessing(true);
        try {
            const payload = {
                shipping_address: shippingAddress,
                direct_item: directItem ? {
                    product_id: directItem.product_id,
                    quantity: directItem.quantity,
                    customization_details: directItem.customization_details,
                    price: directItem.price
                } : null
            };

            const res = await api.post('/orders/checkout', payload);
            const orderId = res.data.order_id;

            // Simulate Payment Success
            await api.post(`/orders/payment-success?order_id=${orderId}`);

            // Success! Generate Receipt
            setReceiptData({
                orderId: orderId,
                date: new Date().toLocaleString(),
                items: items.map(item => ({
                    name: directItem ? item.product_name : (item.product?.name || 'Product'),
                    qty: item.quantity,
                    price: directItem ? item.price : (item.total_price / item.quantity)
                })),
                total: calculateTotal(),
                paymentMode: paymentMode,
                shippingAddress: shippingAddress,
                transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`
            });

            setShowReceipt(true);
            window.dispatchEvent(new Event('cartUpdated')); // Refresh cart count
        } catch (err) {
            alert('Order failed: ' + (err.response?.data?.detail || err.message));
        } finally {
            setProcessing(false);
        }
    };

    const handlePrint = () => {
        const printContent = receiptRef.current;
        const win = window.open('', '', 'width=800,height=600');
        win.document.write(`
            <html><head><title>Receipt - Order #${receiptData.orderId}</title>
            <style>
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; }
                .receipt-header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
                .total-row { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            </style></head><body>
            ${printContent.innerHTML}
            </body></html>
        `);
        win.document.close();
        win.print();
    };

    if (loading) return <div className="loading-screen">Preparing Checkout...</div>;

    if (showReceipt && receiptData) {
        return (
            <div className="checkout-container">
                <div className="container">
                    <div className="receipt-wrapper">
                        <div className="receipt-card" ref={receiptRef}>
                            <div className="receipt-header">
                                <CheckCircle size={60} color="#10b981" style={{ marginBottom: '15px' }} />
                                <h1>Order Confirmed!</h1>
                                <p>Thank you for your purchase.</p>
                            </div>
                            
                            <div className="receipt-meta-grid">
                                <div><strong>Order #</strong><p>{receiptData.orderId}</p></div>
                                <div><strong>Date</strong><p>{receiptData.date}</p></div>
                                <div><strong>Payment</strong><p>{receiptData.paymentMode}</p></div>
                                <div><strong>Txn ID</strong><p>{receiptData.transactionId}</p></div>
                            </div>

                            <table className="receipt-table">
                                <thead>
                                    <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
                                </thead>
                                <tbody>
                                    {receiptData.items.map((it, i) => (
                                        <tr key={i}>
                                            <td>{it.name}</td>
                                            <td>{it.qty}</td>
                                            <td>₹{it.price.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="summary-total" style={{ marginTop: '30px' }}>
                                <span>Total Paid</span>
                                <span>₹{receiptData.total.toFixed(2)}</span>
                            </div>

                            <div className="receipt-footer" style={{ marginTop: '40px', color: '#64748b', fontSize: '14px', textAlign: 'center' }}>
                                <p>Shipping to: {receiptData.shippingAddress}</p>
                                <p style={{ marginTop: '10px' }}>A confirmation email has been sent to {user.email}</p>
                            </div>
                        </div>

                        <div className="receipt-actions" style={{ display: 'flex', gap: '20px', marginTop: '30px', justifyContent: 'center' }}>
                            <button className="btn-secondary" onClick={handlePrint}><Printer size={18} /> Print Receipt</button>
                            <button className="btn-primary" onClick={() => navigate('/my-orders')}>View Order History</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={18} /> Back
                </button>
                
                <h1>Checkout</h1>
                
                <div className="checkout-grid">
                    <div className="checkout-left">
                        <div className="checkout-section">
                            <h3><MapPin size={20} /> Shipping Address</h3>
                            <textarea 
                                className="address-textarea"
                                placeholder="Enter your full delivery address..."
                                rows="4"
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="checkout-section">
                            <h3><CreditCard size={20} /> Payment Method</h3>
                            <div className="payment-grid">
                                {['UPI', 'Credit Card', 'Debit Card', 'Cash on Delivery'].map(mode => (
                                    <div 
                                        key={mode} 
                                        className={`payment-card ${paymentMode === mode ? 'active' : ''}`}
                                        onClick={() => setPaymentMode(mode)}
                                    >
                                        {mode}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="checkout-summary-card">
                        <h3>Order Summary</h3>
                        <div className="summary-items">
                            {items.map((item, idx) => (
                                <div key={idx} className="summary-item">
                                    <span>{directItem ? item.product_name : (item.product?.name || 'Product')} (x{item.quantity})</span>
                                    <span>₹{(directItem ? (item.price * item.quantity) : item.total_price).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                            <span>Shipping</span>
                            <span>FREE</span>
                        </div>

                        <div className="summary-total">
                            <span>Total</span>
                            <span>₹{calculateTotal().toFixed(2)}</span>
                        </div>

                        <button 
                            className="place-order-btn" 
                            disabled={processing}
                            onClick={handleConfirmOrder}
                        >
                            {processing ? 'Processing...' : `Place Order — ₹${calculateTotal().toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
