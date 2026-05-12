import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, LogOut, ClipboardList, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchCounts();
        } else {
            setCartCount(0);
            setWishlistCount(0);
        }

        const handleUpdate = () => fetchCounts();
        window.addEventListener('cartUpdated', handleUpdate);
        window.addEventListener('wishlistUpdated', handleUpdate);
        return () => {
            window.removeEventListener('cartUpdated', handleUpdate);
            window.removeEventListener('wishlistUpdated', handleUpdate);
        };
    }, [user, location.pathname]);

    const fetchCounts = async () => {
        try {
            const [cartRes, wishRes] = await Promise.all([
                api.get('/admin/cart-count'),
                api.get('/admin/wishlist-count').catch(() => ({ data: { count: 0 } }))
            ]);
            setCartCount(cartRes.data.count || 0);
            setWishlistCount(wishRes.data.count || 0);
        } catch {
            // Silently fail or set to 0
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-logo">
                    <Link to="/" className="cursive-font">PrintHub Studio</Link>
                </div>
                
                {/* Menu */}
                <ul className="navbar-menu">
                    <li><Link to="/" className={isActive('/') ? 'active' : ''}>HOME</Link></li>
                    <li><Link to="/products" className={isActive('/products') ? 'active' : ''}>ALL PRODUCTS</Link></li>
                    <li><Link to="/blog" className={isActive('/blog') ? 'active' : ''}>BLOG</Link></li>
                    <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''}>CONTACT</Link></li>
                    {user && (
                        <li><Link to="/my-orders" className={isActive('/my-orders') ? 'active' : ''}>ORDERS</Link></li>
                    )}
                </ul>

                {/* Right */}
                <div className="navbar-right">
                    <div className="auth-links">
                        {user ? (
                            <div className="user-profile">
                                <span className="user-name">{user.name || user.email.split('@')[0]}</span>
                                {user.role === 'admin' ? (
                                    <Link to="/admin" className="role-tag admin">Admin</Link>
                                ) : (
                                    <Link to="/my-orders" className="role-tag">Customer</Link>
                                )}
                                <button onClick={handleLogout} className="logout-btn" title="Logout">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="login-reg-link">Login / Register</Link>
                        )}
                    </div>
                    
                    <div className="navbar-icons">
                        <Link to="/wishlist" className="icon-btn search-trigger" title="Wishlist">
                            <Heart size={20} strokeWidth={1.5} />
                            {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
                        </Link>
                        <Link to="/cart" className="icon-btn">
                            <ShoppingBag size={20} strokeWidth={1.5} />
                            {cartCount > 0 && <span className="badge">{cartCount}</span>}
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
