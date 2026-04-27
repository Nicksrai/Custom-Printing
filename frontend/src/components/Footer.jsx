import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="site-footer">
            {/* Instagram Gallery Strip */}
            <div className="insta-strip">
                {[
                    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&q=80',
                    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&q=80',
                    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&q=80',
                    'https://images.unsplash.com/photo-1596755094514-f87e32f85e42?w=300&q=80',
                    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&q=80',
                    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=300&q=80'
                ].map((img, idx) => (
                    <div key={idx} className="insta-item" style={{ backgroundImage: `url(${img})` }}></div>
                ))}
            </div>

            {/* Main Footer */}
            <div className="footer-main">
                <div className="container">
                    <div className="footer-grid">
                        {/* Brand Column */}
                        <div className="footer-col brand-col">
                            <h3 className="cursive-font footer-logo">Custom Wears</h3>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt cilisis.</p>
                            <div className="payment-icons">
                                <span className="pay-icon">VISA</span>
                                <span className="pay-icon">MC</span>
                                <span className="pay-icon">GPay</span>
                                <span className="pay-icon">PayPal</span>
                                <span className="pay-icon">APay</span>
                                <span className="pay-icon">Stripe</span>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-col">
                            <h4>QUICK LINKS</h4>
                            <ul>
                                <li><Link to="/products">About</Link></li>
                                <li><Link to="/blog">Blogs</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                                <li><Link to="/products">FAQ</Link></li>
                            </ul>
                        </div>

                        {/* Account */}
                        <div className="footer-col">
                            <h4>ACCOUNT</h4>
                            <ul>
                                <li><Link to="/login">My Account</Link></li>
                                <li><Link to="/cart">Orders Tracking</Link></li>
                                <li><Link to="/cart">Checkout</Link></li>
                                <li><Link to="/products">Wishlist</Link></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div className="footer-col">
                            <h4>NEWSLETTER</h4>
                            <div className="newsletter-form">
                                <input type="email" placeholder="Email" />
                                <button>SUBSCRIBE</button>
                            </div>
                            <div className="social-icons">
                                <a href="#" className="social-icon">f</a>
                                <a href="#" className="social-icon">𝕏</a>
                                <a href="#" className="social-icon">▶</a>
                                <a href="#" className="social-icon">📷</a>
                                <a href="#" className="social-icon">📌</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="footer-bottom">
                <div className="container">
                    <p>Copyright © 2026 All rights reserved | Custom Wears - Made with ❤️</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
