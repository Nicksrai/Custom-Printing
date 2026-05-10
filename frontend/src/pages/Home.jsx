import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShoppingCart, Heart, Eye, Activity, ShieldCheck, Headphones, CreditCard } from 'lucide-react';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeOffer, setActiveOffer] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes, offerRes] = await Promise.all([
                    api.get('/products/'),
                    api.get('/products/categories'),
                    api.get('/offer/active').catch(() => ({ data: null }))
                ]);
                setProducts(prodRes.data);
                setCategories(catRes.data);
                if (offerRes.data) {
                    setActiveOffer(offerRes.data);
                }
            } catch (err) {
                console.error("Could not fetch data", err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!activeOffer || !activeOffer.end_date) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(activeOffer.end_date).getTime();
            const diff = end - now;

            if (diff <= 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    secs: Math.floor((diff % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [activeOffer]);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const handleAddToCart = async (productId) => {
        try {
            await api.post('/orders/cart', {
                product_id: productId,
                quantity: 1,
                customization_details: JSON.stringify({})
            });
            alert('Added to cart!');
            // To update navbar count immediately, we could use a custom event or a context update
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            navigate('/login');
        }
    };

    const renderStars = () => (
        <div className="product-rating">
            {[1, 2, 3, 4, 5].map(i => <span key={i} className="star">★</span>)}
        </div>
    );

    const filteredProducts = activeFilter === 'All'
        ? products
        : products.filter(p => categories.find(c => c.id === p.category_id)?.name === activeFilter);

    // Hero category config with fallback colors & default images
    const heroBg = ['#f4edeb', '#cae5e8', '#e3e0ec', '#fddee9', '#e3f2fd', '#fff3e0'];
    const defaultHeroImages = [
        '/uploads/kids_zone.jpg',
        '/uploads/wall_decorative.jpg',
        '/uploads/home_decorative.jpg',
        '/uploads/fashion_accessories.jpg',
        '/uploads/photo_album.jpg',
        '/uploads/desk_decorative.jpg'
    ];
    const defaultNames = ["Kids Zone", "Wall Decorative", "Home Decorative", "Fashion Accessories", "Photo Album & Print", "Desk Decorative"];
    const defaultCounts = ['', '358 items', '273 items', '159 items', '792 items'];

    return (
        <div className="home-content">

            {/* ===== HERO MASONRY GRID ===== */}
            <section className="hero-masonry">
                {/* Large Left Panel */}
                <div className="hero-left" style={{ backgroundColor: heroBg[0] }}>
                    <div className="hero-left-img">
                        <img src={categories[0] ? getImageUrl(categories[0].image_url) : getImageUrl(defaultHeroImages[0])} alt={categories[0]?.name || defaultNames[0]} />
                    </div>
                    <div className="hero-left-text">
                        <h1 className="cursive-font">{categories[0]?.name || defaultNames[0]}</h1>
                        <p>{categories[0]?.description || "Sitamet, consectetur adipiscing elit, sed do eiusmod tempor incidid-unt labore edolore magna aliquapendisse ultrices gravida."}</p>
                        <Link to={categories[0] ? `/products?cat=${categories[0].id}` : '/products'} className="shop-now-btn">SHOP NOW</Link>
                    </div>
                </div>

                {/* Right 2x2 Grid -> Expanded */}
                <div className="hero-right-grid">
                    {[1, 2, 3, 4, 5].map((idx) => {
                        const cat = categories[idx];
                        return (
                            <div key={idx} className="hero-small-card" style={{ backgroundColor: heroBg[idx] }}>
                                <div className="hero-small-text">
                                    <h3>{cat?.name || defaultNames[idx]}</h3>
                                    <p className="item-count">{cat ? 'View Collection' : 'Browse'}</p>
                                    <Link to={cat ? `/products?cat=${cat.id}` : '/products'} className="shop-now-btn">SHOP NOW</Link>
                                </div>
                                <div className="hero-small-img">
                                    <img src={cat ? getImageUrl(cat.image_url) : getImageUrl(defaultHeroImages[idx])} alt={cat?.name || defaultNames[idx]} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ===== NEW PRODUCTS SECTION ===== */}
            <section className="product-section">
                <div className="container">
                    <div className="section-header-split">
                        <h2 className="section-title">NEW PRODUCT</h2>
                        <ul className="product-filters">
                            <li className={activeFilter === 'All' ? 'active' : ''} onClick={() => setActiveFilter('All')}>All</li>
                            {categories.map(cat => (
                                <li key={cat.id} className={activeFilter === cat.name ? 'active' : ''} onClick={() => setActiveFilter(cat.name)}>
                                    {cat.name}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="product-grid">
                        {filteredProducts.slice(0, 8).map(prod => (
                            <div key={prod.id} className="product-card">
                                <div className="product-image-container">
                                    <div className="product-image" style={{ backgroundImage: `url(${getImageUrl(prod.image_url) || 'https://via.placeholder.com/400x500?text=No+Image'})` }}></div>
                                    <ul className="product-hover-actions">
                                        <li><Link to={`/product/${prod.id}`}><Eye size={18} /></Link></li>
                                        <li><Heart size={18} /></li>
                                        <li onClick={() => handleAddToCart(prod.id)}><ShoppingCart size={18} /></li>
                                    </ul>
                                </div>
                                <div className="product-info">
                                    <h6><Link to={`/product/${prod.id}`}>{prod.name}</Link></h6>
                                    {renderStars()}
                                    <div className="product-price">₹ {prod.base_price.toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== DYNAMIC OFFER BANNER ===== */}
            <section className="banner-section">
                <div className="banner-bg" style={{ backgroundImage: `url(${activeOffer?.banner_image_url || 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1600&q=80'})` }}></div>
                <div className="container banner-container">
                    <div className="banner-circle">
                        <span className="discount-label">{activeOffer?.discount_text || 'DISCOUNT'}</span>
                        <h2 className="cursive-font text-primary">{activeOffer?.title || 'Summer 2030'}</h2>
                        <span className="sale-label">{activeOffer?.subtitle || 'SALE 50%'}</span>
                        <div className="countdown">
                            <div className="cd-item"><span>{timeLeft.days}</span><small>Day</small></div>
                            <div className="cd-item"><span>{timeLeft.hours}</span><small>Hour</small></div>
                            <div className="cd-item"><span>{timeLeft.mins}</span><small>Min</small></div>
                            <div className="cd-item"><span>{timeLeft.secs}</span><small>Sec</small></div>
                        </div>
                        <Link to="/products" className="shop-now-btn" style={{ marginTop: '15px' }}>SHOP NOW</Link>
                    </div>
                </div>
            </section>

            {/* ===== CATEGORIZED LISTS ===== */}
            <section className="categorized-lists">
                <div className="container">
                    <div className="lists-grid">
                        {['HOT TREND', 'BEST SELLER', 'FEATURE'].map((title, colIdx) => (
                            <div key={title} className="list-col">
                                <h4 className="list-title">{title}</h4>
                                {products.slice(colIdx * 3, colIdx * 3 + 3).map(prod => (
                                    <div key={`${title}-${prod.id}`} className="list-item">
                                        <div className="list-item-img" style={{ backgroundImage: `url(${getImageUrl(prod.image_url) || 'https://via.placeholder.com/100'})` }}></div>
                                        <div className="list-item-text">
                                            <h6><Link to={`/product/${prod.id}`}>{prod.name}</Link></h6>
                                            {renderStars()}
                                            <div className="list-price">₹ {prod.base_price.toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES STRIP ===== */}
            <section className="features-strip">
                <div className="container">
                    <div className="features-flex">
                        <div className="feature-item">
                            <Activity className="icon-red" size={32} />
                            <div className="f-text"><h6>Free Shipping</h6><p>For all order over ₹99</p></div>
                        </div>
                        <div className="feature-item">
                            <ShieldCheck className="icon-red" size={32} />
                            <div className="f-text"><h6>Money Back Guarantee</h6><p>If goods have Problems</p></div>
                        </div>
                        <div className="feature-item">
                            <Headphones className="icon-red" size={32} />
                            <div className="f-text"><h6>Online Support 24/7</h6><p>Dedicated support</p></div>
                        </div>
                        <div className="feature-item">
                            <CreditCard className="icon-red" size={32} />
                            <div className="f-text"><h6>Payment Secure</h6><p>100% secure payment</p></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
