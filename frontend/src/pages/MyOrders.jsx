import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MyOrders.css';
import { Package, Truck, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
            case 'New': return <Clock size={20} color="#f59e0b" />;
            case 'Designing': return <Package size={20} color="#3b82f6" />;
            case 'Printing': return <Package size={20} color="#8b5cf6" />;
            case 'Ready': return <Truck size={20} color="#8b5cf6" />;
            case 'Delivered': return <CheckCircle size={20} color="#10b981" />;
            case 'Cancelled': return <XCircle size={20} color="#ef4444" />;
            default: return <Clock size={20} color="#6b7280" />;
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const handleDownloadInvoice = (order) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(33, 37, 41);
        doc.text("INVOICE", 105, 20, { align: "center" });

        doc.setFontSize(12);
        doc.text("PrintHub Studio", 20, 30);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("123 Printing Street, Creative City", 20, 35);
        doc.text("Contact: +91 9876543210", 20, 40);

        // Order Info
        doc.setTextColor(0);
        doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 140, 35);
        doc.text(`Order ID: #${order.id}`, 140, 40);

        // Customer Info
        doc.line(20, 45, 190, 45);
        doc.setFontSize(11);
        doc.text("Bill To:", 20, 55);
        doc.setFontSize(10);
        doc.text(user.name || "Customer", 20, 60);
        doc.text(order.shipping_address || "N/A", 20, 65);

        // Table
        const tableColumn = ["Product", "Quantity", "Price", "Total"];
        const tableRows = [];

        order.items.forEach(item => {
            const itemData = [
                item.product_name,
                item.quantity,
                `₹${item.price.toFixed(2)}`,
                `₹${(item.price * item.quantity).toFixed(2)}`
            ];
            tableRows.push(itemData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 75,
            theme: 'grid',
            headStyles: { fillColor: [33, 37, 41] }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text(`Grand Total: ₹${order.total_amount.toFixed(2)}`, 140, finalY);

        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Thank you for shopping with PrintHub Studio!", 105, finalY + 20, { align: "center" });

        doc.save(`Invoice_Order_${order.id}.pdf`);
    };

    const TrackingStepper = ({ status }) => {
        const steps = ['New', 'Designing', 'Printing', 'Ready', 'Delivered'];
        const currentStepIndex = steps.indexOf(status);
        
        if (status === 'Cancelled') {
            return (
                <div className="tracking-cancelled">
                    <XCircle size={20} color="#ef4444" />
                    <span>This order has been cancelled</span>
                </div>
            );
        }

        return (
            <div className="tracking-stepper">
                {steps.map((step, index) => (
                    <div key={step} className={`step ${index <= currentStepIndex ? 'active' : ''} ${index === currentStepIndex ? 'current' : ''}`}>
                        <div className="step-dot">
                            {index < currentStepIndex ? <CheckCircle size={14} /> : <span>{index + 1}</span>}
                        </div>
                        <span className="step-label">{step}</span>
                        {index < steps.length - 1 && <div className="step-line"></div>}
                    </div>
                ))}
            </div>
        );
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
                                            <span className="value">₹{order.total_amount.toFixed(2)}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="label">SHIP TO</span>
                                            <span className="value truncate" title={order.shipping_address}>{order.shipping_address}</span>
                                        </div>
                                    </div>
                                    <div className="order-id">
                                        <span className="label">ORDER # {order.id}</span>
                                        <button className="invoice-btn" onClick={() => handleDownloadInvoice(order)}>
                                            <FileText size={16} /> Invoice
                                        </button>
                                    </div>
                                </div>

                                <div className="order-body">
                                    <div className="order-tracking-section">
                                        <h5>Order Progress</h5>
                                        <TrackingStepper status={order.status} />
                                    </div>

                                    <div className="order-footer-meta">
                                        <span className="payment-status">
                                            Payment Status: <strong className={order.payment_status === 'completed' ? 'paid' : 'unpaid'}>{order.payment_status}</strong>
                                        </span>
                                    </div>

                                    <div className="order-items">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <div className="item-info">
                                                    <h6>{item.product_name}</h6>
                                                    <p>Quantity: {item.quantity}</p>
                                                    <p className="item-price">₹{item.price.toFixed(2)}</p>
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
