import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ChevronLeft, Download, Printer, MapPin, Mail, Phone, Calendar, Package } from 'lucide-react';
import './AdminOrderDetail.css';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            const res = await api.get(`/admin/orders/${id}`);
            setOrder(res.data);
        } catch (err) {
            console.error("Failed to fetch order details", err);
            alert("Order not found");
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadJobSheet = async () => {
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.default || jsPDFModule;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.text(`JOB SHEET - ORDER #${order.id}`, 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });
        doc.line(20, 35, 190, 35);

        // Customer Info
        doc.setFontSize(12);
        doc.text("CUSTOMER INFORMATION", 20, 45);
        doc.setFontSize(10);
        doc.text(`Name: ${order.customer_name}`, 20, 52);
        doc.text(`Email: ${order.customer_email}`, 20, 58);
        doc.text(`Address: ${order.shipping_address}`, 20, 64);

        doc.line(20, 72, 190, 72);

        // Items
        doc.setFontSize(12);
        doc.text("ITEMS & CUSTOMIZATION", 20, 88);
        
        let yPos = 98;
        order.items.forEach((item, index) => {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            
            doc.setFontSize(11);
            doc.text(`${index + 1}. ${item.product_name} (Qty: ${item.quantity})`, 20, yPos);
            yPos += 7;
            
            if (item.customization) {
                const custom = JSON.parse(item.customization);
                doc.setFontSize(9);
                if (custom.text) { doc.text(`- Text: "${custom.text}"`, 30, yPos); yPos += 5; }
                if (custom.color) { doc.text(`- Base Color: ${custom.color}`, 30, yPos); yPos += 5; }
                if (custom.side) { doc.text(`- Print Side: ${custom.side}`, 30, yPos); yPos += 5; }
                if (custom.uploadedDesign) {
                    doc.setTextColor(0, 0, 255);
                    doc.text(`- Design Link: http://localhost:8000${custom.uploadedDesign}`, 30, yPos);
                    doc.setTextColor(0);
                    yPos += 5;
                }
            }
            yPos += 10;
        });

        doc.save(`Order_${order.id}_JobSheet.pdf`);
    };

    if (loading) return <div className="admin-loading">Loading order details...</div>;
    if (!order) return null;

    return (
        <div className="admin-order-detail-container">
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>
                    <ChevronLeft size={20} /> Back to Dashboard
                </button>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => window.print()}>
                        <Printer size={18} /> Print Page
                    </button>
                    <button className="btn-primary" onClick={handleDownloadJobSheet}>
                        <Download size={18} /> Download Job Sheet
                    </button>
                </div>
            </header>

            <div className="detail-content">
                <div className="detail-grid">
                    {/* Left Column: Order Status & Customer */}
                    <div className="detail-sidebar">
                        <section className="info-card">
                            <h3>Order Overview</h3>
                            <div className="status-banner" data-status={order.status}>
                                {order.status}
                            </div>
                            <div className="meta-list">
                                <div className="meta-item">
                                    <Calendar size={16} />
                                    <span>Placed on: {new Date(order.created_at).toLocaleString()}</span>
                                </div>
                                <div className="meta-item">
                                    <Package size={16} />
                                    <span>Amount: ₹{order.total_amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </section>

                        <section className="info-card">
                            <h3>Customer Details</h3>
                            <div className="meta-list">
                                <div className="meta-item">
                                    <Mail size={16} />
                                    <span>{order.customer_email}</span>
                                </div>
                                <div className="meta-item address">
                                    <MapPin size={16} />
                                    <span>{order.shipping_address}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Items & Designs */}
                    <div className="detail-main">
                        <section className="info-card">
                            <h3>Ordered Items ({order.items.length})</h3>
                            <div className="items-list">
                                {order.items.map((item, idx) => {
                                    let custom = null;
                                    try {
                                        custom = item.customization ? JSON.parse(item.customization) : null;
                                    } catch (e) {
                                        console.error("Failed to parse customization", item.customization);
                                    }
                                    return (
                                        <div key={idx} className="item-detail-row">
                                            <div className="item-header">
                                                <h4>{item.product_name} <span className="qty">x{item.quantity}</span></h4>
                                                <span className="price">₹{item.price.toFixed(2)}</span>
                                            </div>
                                            
                                            {custom ? (
                                                <div className="customization-summary">
                                                    <div className="custom-specs">
                                                        {custom.text && (
                                                            <div className="spec-group">
                                                                <label>Print Text</label>
                                                                <div className="spec-val text-val">"{custom.text}"</div>
                                                            </div>
                                                        )}
                                                        {custom.color && (
                                                            <div className="spec-group">
                                                                <label>Base Color</label>
                                                                <div className="spec-val">
                                                                    <span className="color-dot" style={{backgroundColor: custom.color}}></span>
                                                                    {custom.color}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {custom.side && (
                                                            <div className="spec-group">
                                                                <label>Position</label>
                                                                <div className="spec-val">{custom.side}</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {custom.uploadedDesign && (
                                                        <div className="design-preview-section">
                                                            <label>Uploaded Design / Reference</label>
                                                            <div className="design-frame">
                                                                <img src={`http://localhost:8000${custom.uploadedDesign}`} alt="Custom Design" />
                                                                <a 
                                                                    href={`http://localhost:8000${custom.uploadedDesign}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="zoom-btn"
                                                                >
                                                                    View Full Resolution
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="no-custom">No customization for this item.</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
