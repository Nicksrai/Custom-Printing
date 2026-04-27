import React from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';

const blogPosts = [
    {
        id: 1,
        title: "The Art of Custom T-Shirt Printing: A Complete Guide",
        excerpt: "Discover the latest techniques in custom apparel printing and how to create stunning personalized designs...",
        author: "Emma Tindale",
        date: "Sep 17, 2030",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
        large: true
    },
    {
        id: 2,
        title: "Top 10 Trending Custom Print Designs This Season",
        excerpt: "From minimalist typography to bold graphic prints, here are the hottest custom design trends...",
        author: "Emma Tindale",
        date: "Sep 17, 2030",
        image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80"
    },
    {
        id: 3,
        title: "How to Choose the Perfect Fabric for Your Custom Wear",
        excerpt: "Not all fabrics are created equal. Learn which materials work best for different printing methods...",
        author: "Emma Tindale",
        date: "Sep 17, 2030",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80"
    },
    {
        id: 4,
        title: "Behind the Scenes: Our Custom Printing Process",
        excerpt: "Take a peek inside our workshop and see how we transform your designs into wearable art...",
        author: "James Wilson",
        date: "Aug 25, 2030",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80"
    },
    {
        id: 5,
        title: "5 Tips for Designing Your Own Merchandise Line",
        excerpt: "Starting your own merch brand? Here are essential tips to make your custom designs stand out...",
        author: "James Wilson",
        date: "Aug 20, 2030",
        image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80"
    },
    {
        id: 6,
        title: "Sustainable Fashion: Eco-Friendly Printing Solutions",
        excerpt: "Learn about our commitment to sustainable custom printing using organic inks and recycled materials...",
        author: "Sarah Chen",
        date: "Jul 15, 2030",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80"
    }
];

const Blog = () => {
    return (
        <div className="blog-page">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <div className="container">
                    <Link to="/">🏠 Home</Link> <span className="sep">&gt;</span> <span className="current">Blog</span>
                </div>
            </div>

            <div className="container">
                <div className="blog-grid">
                    {blogPosts.map((post, idx) => (
                        <div key={post.id} className={`blog-card ${idx === 0 ? 'blog-card-large' : ''}`}>
                            <div className="blog-image" style={{ backgroundImage: `url(${post.image})` }}></div>
                            <div className="blog-content">
                                <h3>{post.title}</h3>
                                {idx === 0 && <p className="blog-excerpt">{post.excerpt}</p>}
                                <div className="blog-meta">
                                    <span className="blog-author">by {post.author}</span>
                                    <span className="blog-separator">|</span>
                                    <span className="blog-date">{post.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
