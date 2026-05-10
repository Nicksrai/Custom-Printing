import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShoppingCart, Heart } from 'lucide-react';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    api.get('/products/'),
                    api.get('/products/categories')
                ]);
                setProducts(prodRes.data);
                setCategories(catRes.data);

                const catParam = searchParams.get('cat');
                if (catParam) {
                    const found = catRes.data.find(c => c.id === parseInt(catParam));
                    if (found) setActiveCategory(found.name);
                }
            } catch (err) {
                console.error("Could not fetch data", err);
            }
        };
        fetchData();
    }, [searchParams]);

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x500?text=No+Image';
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
        } catch (err) {
            if (err.response && err.response.status === 401) {
                navigate('/login');
            } else {
                alert('Please log in first.');
                navigate('/login');
            }
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'All' || 
            categories.find(c => c.id === p.category_id)?.name === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const renderStars = () => (
        <div className="product-rating">
            {[1,2,3,4,5].map(i => <span key={i} className="star">★</span>)}
        </div>
    );

    return (
        <div className="products-page">
            <div className="container">
                <div className="products-page-header">
                    <h1>Shop All Products</h1>
                    <ul className="product-filters">
                        <li className={activeCategory === 'All' ? 'active' : ''} onClick={() => setActiveCategory('All')}>All</li>
                        {categories.map(cat => (
                            <li 
                                key={cat.id}
                                className={activeCategory === cat.name ? 'active' : ''}
                                onClick={() => setActiveCategory(cat.name)}
                            >
                                {cat.name}
                            </li>
                        ))}
                    </ul>
                    <div className="search-bar-container">
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="product-search-input"
                        />
                    </div>
                </div>

                <div className="product-grid">
                    {filteredProducts.map(prod => (
                        <div key={prod.id} className="product-card">
                            <div className="product-image-container">
                                <div className="product-image" style={{ backgroundImage: `url(${getImageUrl(prod.image_url)})` }}></div>
                                <ul className="product-hover-actions">
                                    <li><Link to={`/product/${prod.id}`}><Heart size={18} /></Link></li>
                                    <li onClick={() => handleAddToCart(prod.id)}><ShoppingCart size={18} /></li>
                                </ul>
                            </div>
                            <div className="product-info">
                                <h6><Link to={`/product/${prod.id}`}>{prod.name}</Link></h6>
                                {renderStars()}
                                <div className="product-price">$ {prod.base_price.toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="no-products">
                        <p>No products found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
