import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { BarChart, Users, Package, ShoppingBag, LayoutDashboard, ChevronDown, Eye, Tag, Trash2, ClipboardList, Search, Filter } from 'lucide-react';
import ProductPreview from '../components/ProductPreview';
import './Admin.css';

const Admin = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    // Data states
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [offers, setOffers] = useState([]);
    const [requirements, setRequirements] = useState([]);

    // Search/Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [catFilter, setCatFilter] = useState('');

    // Form states
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddOffer, setShowAddOffer] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [reqForm, setReqForm] = useState({
        customer_name: '', product_category: 'Mug', color: '#ffffff', quantity: 1, notes: '', custom_text: ''
    });
    
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchDashboardStats();
    }, [user]);

    useEffect(() => {
        if (activeTab === 'products') {
            fetchProducts();
            fetchCategories();
        } else if (activeTab === 'orders') {
            fetchOrders();
        } else if (activeTab === 'users') {
            fetchCustomers();
        } else if (activeTab === 'offers') {
            fetchOffers();
        } else if (activeTab === 'requirements') {
            fetchRequirements();
        }
    }, [activeTab]);

    const fetchDashboardStats = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch admin stats", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products/');
            setProducts(res.data);
        } catch(err) { console.error("Failed to load products"); }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/products/categories');
            setCategories(res.data);
        } catch(err) { console.error("Failed to load categories"); }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            setOrders(res.data);
        } catch(err) { console.error("Failed to load orders", err); }
    };

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/admin/users');
            setCustomers(res.data);
        } catch(err) { console.error("Failed to load customers", err); }
    };

    const fetchOffers = async () => {
        try {
            const res = await api.get('/admin/offers');
            setOffers(res.data);
        } catch(err) { console.error("Failed to load offers"); }
    };
    
    const fetchRequirements = async () => {
        try {
            const res = await api.get('/admin/requirements');
            setRequirements(res.data);
        } catch(err) { console.error("Failed to load requirements"); }
    };

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/products/upload-design', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data.url;
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/api/admin/orders/${orderId}/status?status=${newStatus}`);
            fetchOrders();
        } catch(err) {
            alert('Failed to update order status');
        }
    };

    const handleCreateRequirement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/requirements', reqForm);
            alert('Requirement Saved!');
            setReqForm({ customer_name: '', product_category: 'Mug', color: '#ffffff', quantity: 1, notes: '', custom_text: '' });
            fetchRequirements();
        } catch(err) {
            alert('Failed to save requirement');
        }
    };

    const handleUpdateReqStatus = async (id, status) => {
        try {
            await api.put(`/admin/requirements/${id}/status?status=${status}`);
            fetchRequirements();
        } catch(err) { alert('Failed to update status'); }
    };

    const handleDeleteOffer = async (id) => {
        if (!window.confirm("Delete this offer?")) return;
        try {
            await api.delete(`/admin/offers/${id}`);
            fetchOffers();
        } catch (err) {
            alert("Failed to delete offer");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': '#f59e0b',
            'Designing': '#3b82f6',
            'Printing': '#8b5cf6',
            'Ready': '#10b981',
            'Delivered': '#059669',
            'Cancelled': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    // Sub-components for forms
    const AddCategoryForm = () => {
        const [name, setName] = useState('');
        const [desc, setDesc] = useState('');
        const [file, setFile] = useState(null);
        const [uploading, setUploading] = useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setUploading(true);
            try {
                let imgUrl = null;
                if (file) imgUrl = await handleUpload(file);
                
                await api.post('/products/categories', {
                    name, 
                    description: desc,
                    image_url: imgUrl
                });
                alert('Category Added!');
                setShowAddCategory(false);
                fetchCategories();
            } catch (err) {
                alert('Error adding category: ' + (err.response?.data?.detail || err.message));
            } finally { setUploading(false); }
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Add New Category</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Category Name <span>*</span></label>
                            <input required type="text" value={name} onChange={e=>setName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input type="text" value={desc} onChange={e=>setDesc(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Category Display Image</label>
                            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={()=>setShowAddCategory(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Save Category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const AddProductForm = () => {
        const [name, setName] = useState('');
        const [price, setPrice] = useState('');
        const [catId, setCatId] = useState('');
        const [desc, setDesc] = useState('');
        const [featureLine, setFeatureLine] = useState('');
        const [file, setFile] = useState(null);
        const [uploading, setUploading] = useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            if(!catId) return alert('Select Category!');
            setUploading(true);
            try {
                let imgUrl = null;
                if (file) imgUrl = await handleUpload(file);
                
                await api.post('/products/', {
                    name,
                    base_price: parseFloat(price),
                    category_id: parseInt(catId),
                    description: desc,
                    features: featureLine,
                    image_url: imgUrl,
                    is_customizable: true,
                    customizations: []
                });
                alert('Product Added!');
                setShowAddProduct(false);
                fetchProducts();
            } catch (err) {
                alert('Error adding product: ' + (err.response?.data?.detail || err.message));
            } finally { setUploading(false); }
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Add New Product</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Product Name <span>*</span></label>
                                <input required type="text" value={name} onChange={e=>setName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Base Price (₹) <span>*</span></label>
                                <input required type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Category <span>*</span></label>
                            <select required value={catId} onChange={e=>setCatId(e.target.value)}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Product Display Image</label>
                            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows="2"></textarea>
                        </div>
                        <div className="form-group">
                            <label>Features (Short blurb)</label>
                            <input type="text" value={featureLine} onChange={e=>setFeatureLine(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={()=>setShowAddProduct(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={uploading}>
                                {uploading ? 'Adding...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const AddOfferForm = () => {
        const [formData, setFormData] = useState({
            title: '', subtitle: '', discount_text: '', end_date: '', banner_image_url: ''
        });
        const [file, setFile] = useState(null);
        const [uploading, setUploading] = useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setUploading(true);
            try {
                let imgUrl = formData.banner_image_url;
                if (file) imgUrl = await handleUpload(file);
                
                await api.post('/admin/offers', { ...formData, banner_image_url: imgUrl });
                alert('Offer Added!');
                setShowAddOffer(false);
                fetchOffers();
            } catch (err) {
                alert('Error adding offer');
            } finally { setUploading(false); }
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Add Banner Offer (Dynamic Clock)</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title (e.g. Summer 2030) <span>*</span></label>
                            <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Subtitle (e.g. SALE 50%)</label>
                            <input type="text" value={formData.subtitle} onChange={e=>setFormData({...formData, subtitle: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Discount Label (e.g. DISCOUNT)</label>
                            <input type="text" value={formData.discount_text} onChange={e=>setFormData({...formData, discount_text: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>End Date (Clock counts down to this) <span>*</span></label>
                            <input required type="datetime-local" value={formData.end_date} onChange={e=>setFormData({...formData, end_date: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Banner Image</label>
                            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={()=>setShowAddOffer(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={uploading}>
                                {uploading ? 'Adding...' : 'Save Offer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    if (loading) return <div className="admin-loading">Loading Admin Panel...</div>;

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                        <ShoppingBag size={20} /> Orders
                    </button>
                    <button className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                        <Package size={20} /> Products
                    </button>
                    <button className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={20} /> Customers
                    </button>
                    <button className={`nav-btn ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => setActiveTab('offers')}>
                        <Tag size={20} /> Offers / Clock
                    </button>
                    <button className={`nav-btn ${activeTab === 'requirements' ? 'active' : ''}`} onClick={() => setActiveTab('requirements')}>
                        <ClipboardList size={20} /> Requirements
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                </header>

                <div className="admin-content">

                    {/* ===== DASHBOARD ===== */}
                    {activeTab === 'dashboard' && stats && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon revenue"><BarChart /></div>
                                    <div className="stat-details">
                                        <h3>Total Revenue</h3>
                                        <p>₹{stats.total_sales.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon orders"><ShoppingBag /></div>
                                    <div className="stat-details">
                                        <h3>Total Orders</h3>
                                        <p>{stats.total_orders} <span className="stat-sub">({stats.pending_orders} pending)</span></p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon users"><Users /></div>
                                    <div className="stat-details">
                                        <h3>Total Customers</h3>
                                        <p>{stats.total_users}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon products"><Package /></div>
                                    <div className="stat-details">
                                        <h3>Products</h3>
                                        <p>{stats.total_products}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-charts">
                                <div className="chart-card revenue-chart">
                                    <h3>Revenue Overview (Monthly)</h3>
                                    <div className="bar-chart-container">
                                        {[
                                            { month: 'Jan', val: 12000 },
                                            { month: 'Feb', val: 19000 },
                                            { month: 'Mar', val: 15000 },
                                            { month: 'Apr', val: 22000 },
                                            { month: 'May', val: 28000 },
                                            { month: 'Jun', val: stats.total_sales || 10000 }
                                        ].map(m => (
                                            <div key={m.month} className="bar-wrapper">
                                                <div className="bar" style={{ height: `${(m.val / 30000) * 100}%` }}>
                                                    <span className="bar-tooltip">₹{m.val.toLocaleString()}</span>
                                                </div>
                                                <span className="month-label">{m.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="chart-card recent-activity">
                                    <h3>Recent Orders</h3>
                                    <div className="mini-table">
                                        {orders.slice(0, 5).map(o => (
                                            <div key={o.id} className="mini-row">
                                                <div className="mini-info">
                                                    <span className="mini-id">#{o.id}</span>
                                                    <span className="mini-name">{o.customer_name}</span>
                                                </div>
                                                <div className="mini-status-price">
                                                    <span className={`mini-status ${o.status.toLowerCase()}`}>{o.status}</span>
                                                    <span className="mini-price">₹{o.total_amount.toFixed(0)}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {orders.length === 0 && <p className="no-data">No recent orders</p>}
                                    </div>
                                    <button className="view-all-link" onClick={() => setActiveTab('orders')}>View All Orders</button>
                                </div>
                            </div>

                            <div className="dashboard-bottom-grid">
                                <div className="chart-card">
                                    <h3>Pending Requirements</h3>
                                    <div className="mini-list">
                                        {requirements.filter(r => r.status !== 'Delivered').slice(0, 4).map(r => (
                                            <div key={r.id} className="mini-item">
                                                <div className="mini-item-icon"><ClipboardList size={16} /></div>
                                                <div className="mini-item-text">
                                                    <strong>{r.customer_name}</strong>
                                                    <p>{r.product_category} - {r.quantity} pcs</p>
                                                </div>
                                                <span className="mini-badge">{r.status}</span>
                                            </div>
                                        ))}
                                        {requirements.length === 0 && <p className="no-data">No pending requirements</p>}
                                    </div>
                                    <button className="view-all-link" onClick={() => setActiveTab('requirements')}>Manage Requirements</button>
                                </div>

                                <div className="chart-card quick-actions">
                                    <h3>Quick Actions</h3>
                                    <div className="actions-grid">
                                        <button onClick={() => { setRequirementForm({ customer_name: '', product_category: '', quantity: 1, notes: '', color: '', custom_text: '' }); setActiveTab('requirements'); }}>
                                            + New Requirement
                                        </button>
                                        <button onClick={() => setActiveTab('products')}>+ Add Product</button>
                                        <button onClick={() => setActiveTab('offers')}>Create Offer</button>
                                        <button onClick={() => window.print()}>Print Report</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ===== ORDERS ===== */}
                    {activeTab === 'orders' && (
                        <div className="data-table-container">
                            <div className="table-actions-header">
                                <h3>All Orders ({orders.length})</h3>
                            </div>
                            
                            {orders.length === 0 ? (
                                <div className="empty-table">
                                    <ShoppingBag size={48} color="#d1d5db" />
                                    <p>No orders yet.</p>
                                </div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Customer</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <React.Fragment key={order.id}>
                                                <tr className={expandedOrder === order.id ? 'row-expanded' : ''}>
                                                    <td><strong>#{order.id}</strong></td>
                                                    <td>{order.customer_name}</td>
                                                    <td><strong>₹{order.total_amount.toFixed(2)}</strong></td>
                                                    <td>
                                                        <span className="status-badge" style={{backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status)}}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`payment-badge ${order.payment_status === 'completed' ? 'paid' : 'unpaid'}`}>
                                                            {order.payment_status}
                                                        </span>
                                                    </td>
                                                    <td className="date-cell">{formatDate(order.created_at)}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="icon-action-btn" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                                                <Eye size={16} />
                                                            </button>
                                                            <select 
                                                                className="status-select"
                                                                value={order.status} 
                                                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                            >
                                                                <option value="New">New</option>
                                                                <option value="Designing">Designing</option>
                                                                <option value="Printing">Printing</option>
                                                                <option value="Ready">Ready</option>
                                                                <option value="Delivered">Delivered</option>
                                                                <option value="Cancelled">Cancelled</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedOrder === order.id && (
                                                    <tr className="expanded-row">
                                                        <td colSpan="7">
                                                            <div className="order-detail-panel">
                                                                <div className="detail-section">
                                                                    <h4>Item Details</h4>
                                                                    <ul>
                                                                        {order.items.map((it, i) => (
                                                                            <li key={i}>{it.product_name} x {it.quantity} - ${it.price.toFixed(2)}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                                <div className="detail-section">
                                                                    <h4>Shipping To</h4>
                                                                    <p>{order.shipping_address}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                    
                    {/* ===== PRODUCTS ===== */}
                    {activeTab === 'products' && (
                        <div className="data-table-container">
                            <div className="table-actions-header">
                                <h3>Product Catalog</h3>
                                <div className="catalog-filters">
                                    <div className="search-box">
                                        <Search size={16} />
                                        <input type="text" placeholder="Search products..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                                    </div>
                                    <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
                                        <option value="">All Categories</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="btn-group">
                                    <button className="primary-btn" onClick={() => setShowAddCategory(true)}>+ Add Category</button>
                                    <button className="primary-btn" onClick={() => setShowAddProduct(true)}>+ Add Product</button>
                                </div>
                            </div>
                            
                            <h4>Products ({products.length})</h4>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Category</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.filter(p => 
                                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
                                        (!catFilter || p.category_id === parseInt(catFilter))
                                    ).map(p => (
                                        <tr key={p.id}>
                                            <td>{p.id}</td>
                                            <td><strong>{p.name}</strong></td>
                                            <td>₹{p.base_price.toFixed(2)}</td>
                                            <td>{categories.find(c => c.id === p.category_id)?.name || p.category_id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ===== CUSTOMERS ===== */}
                    {activeTab === 'users' && (
                        <div className="data-table-container">
                            <div className="table-actions-header">
                                <h3>Customers ({customers.length})</h3>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Orders</th>
                                        <th>Total Spent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map(c => (
                                        <tr key={c.id}>
                                            <td>{c.id}</td>
                                            <td><strong>{c.name}</strong></td>
                                            <td>{c.email}</td>
                                            <td>{c.order_count}</td>
                                            <td>₹{c.total_spent.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ===== OFFERS / CLOCK ===== */}
                    {activeTab === 'offers' && (
                        <div className="data-table-container">
                            <div className="table-actions-header">
                                <h3>Manage Sale Banners & Dynamic Clock</h3>
                                <button className="primary-btn" onClick={() => setShowAddOffer(true)}>+ Create New Offer</button>
                            </div>
                            <p style={{fontSize: '13px', color: '#666', marginBottom: '20px'}}>The offer with the soonest end date will be shown on the home page with a live countdown clock.</p>
                            
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Subtitle</th>
                                        <th>Ends On</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {offers.map(o => (
                                        <tr key={o.id}>
                                            <td>{o.id}</td>
                                            <td><strong>{o.title}</strong></td>
                                            <td>{o.subtitle}</td>
                                            <td className="date-cell">{formatDate(o.end_date)}</td>
                                            <td>
                                                <span className={`status-badge ${o.is_active ? 'paid' : 'cancelled'}`} style={{background: o.is_active ? '#d1fae5' : '#fee2e2', color: o.is_active ? '#059669' : '#ef4444'}}>
                                                    {o.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="icon-action-btn" title="Delete" onClick={() => handleDeleteOffer(o.id)}>
                                                    <Trash2 size={16} color="#ef4444" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ===== REQUIREMENTS ===== */}
                    {activeTab === 'requirements' && (
                        <div className="requirements-tab">
                            <div className="req-grid">
                                <div className="req-form-card">
                                    <h3>New Customer Requirement</h3>
                                    <form onSubmit={handleCreateRequirement}>
                                        <div className="form-group">
                                            <label>Customer Name</label>
                                            <input required type="text" value={reqForm.customer_name} onChange={e=>setReqForm({...reqForm, customer_name: e.target.value})} />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Category</label>
                                                <select value={reqForm.product_category} onChange={e=>setReqForm({...reqForm, product_category: e.target.value})}>
                                                    <option>Mug</option>
                                                    <option>T-Shirt</option>
                                                    <option>Frame</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Color</label>
                                                <input type="color" value={reqForm.color} onChange={e=>setReqForm({...reqForm, color: e.target.value})} />
                                            </div>
                                            <div className="form-group">
                                                <label>Qty</label>
                                                <input type="number" min="1" value={reqForm.quantity} onChange={e=>setReqForm({...reqForm, quantity: parseInt(e.target.value)})} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Custom Text (Instant Preview)</label>
                                            <input type="text" placeholder="Happy Birthday!" value={reqForm.custom_text} onChange={e=>setReqForm({...reqForm, custom_text: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Notes / Instructions</label>
                                            <textarea rows="2" value={reqForm.notes} onChange={e=>setReqForm({...reqForm, notes: e.target.value})}></textarea>
                                        </div>
                                        <button type="submit" className="primary-btn full-width">Save Requirement</button>
                                    </form>
                                </div>
                                
                                <div className="req-preview-card">
                                    <ProductPreview 
                                        type={reqForm.product_category}
                                        color={reqForm.color}
                                        text={reqForm.custom_text}
                                    />
                                </div>
                            </div>

                            <div className="data-table-container" style={{marginTop: '30px'}}>
                                <h3>Requirement History ({requirements.length})</h3>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Product</th>
                                            <th>Text</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requirements.map(r => (
                                            <tr key={r.id}>
                                                <td><strong>{r.customer_name}</strong></td>
                                                <td>{r.product_category} ({r.quantity})</td>
                                                <td><small>{r.custom_text || '-'}</small></td>
                                                <td>
                                                    <select 
                                                        className="status-select small"
                                                        value={r.status} 
                                                        onChange={(e) => handleUpdateReqStatus(r.id, e.target.value)}
                                                        style={{color: getStatusColor(r.status)}}
                                                    >
                                                        <option value="New">New</option>
                                                        <option value="Designing">Designing</option>
                                                        <option value="Printing">Printing</option>
                                                        <option value="Ready">Ready</option>
                                                        <option value="Delivered">Delivered</option>
                                                    </select>
                                                </td>
                                                <td className="date-cell">{formatDate(r.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Render Modals */}
            {showAddCategory && <AddCategoryForm />}
            {showAddProduct && <AddProductForm />}
            {showAddOffer && <AddOfferForm />}
        </div>
    );
};

export default Admin;
