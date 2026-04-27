import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MyOrders.css';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

const MyOrders = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMyOrders();
    }, [user]);

    const fetchMyOrders = async () => {
        try {
            const res = await api.get('/admin/my-orders');
            setOrders(res.data);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={20} color="#f59e0b" />;
            case 'processing': return <Package size={20} color="#3b82f6" />;
            case 'shipped': return <Truck size={20} color="#8b5cf6" />;
            case 'delivered': return <CheckCircle size={20} color="#10b981" />;
            case 'cancelled': return <XCircle size={20} color="#ef4444" />;
            default: return <Clock size={20} color="#6b7280" />;
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    if (loading) return <div className="loading-screen">Loading your orders...</div>;

    return (
        <div className="my-orders-container">
            <div className="container">
                <h1>My Order History</h1>
                
                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <Package size={64} color="#d1d5db" />
                        <p>You haven't placed any orders yet.</p>
                        <button className="shop-btn" onClick={() => navigate('/products')}>Start Shopping</button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-meta">
                                        <div className="meta-item">
                                            <span className="label">ORDER PLACED</span>
                                            <span className="value">{formatDate(order.created_at)}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">TOTAL</span>
                                            <span className="value">${order.total_amount.toFixed(2)}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">SHIP TO</span>
                                            <span className="value truncate" title={order.shipping_address}>{order.shipping_address}</span>
                                        </div>
                                    </div>
                                    <div className="order-id">
                                        <span className="label">ORDER # {order.id}</span>
                                    </div>
                                </div>
                                
                                <div className="order-body">
                                    <div className="order-status-bar">
                                        <div className="status-indicator">
                                            {getStatusIcon(order.status)}
                                            <span className="status-text">{order.status.toUpperCase()}</span>
                                        </div>
                                        <span className="payment-status">
                                            Payment: <strong className={order.payment_status === 'completed' ? 'paid' : 'unpaid'}>{order.payment_status}</strong>
                                        </span>
                                    </div>

                                    <div className="order-items">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <div className="item-info">
                                                    <h6>{item.product_name}</h6>
                                                    <p>Quantity: {item.quantity}</p>
                                                    <p className="item-price">${item.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
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

export default MyOrders;
