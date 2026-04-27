import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        // In production this would POST to the backend
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="contact-page">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <div className="container">
                    <Link to="/">🏠 Home</Link> <span className="sep">&gt;</span> <span className="current">Contact</span>
                </div>
            </div>

            {/* Map Placeholder */}
            <div className="map-section">
                <iframe
                    title="map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.305935303!2d-74.25986548248684!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1650000000000"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                ></iframe>
            </div>

            <div className="container">
                <div className="contact-grid">
                    {/* Contact Info */}
                    <div className="contact-info">
                        <h2>Get in Touch</h2>
                        <p className="contact-intro">We'd love to hear from you! Whether you have a question about our products, custom orders, or anything else, our team is ready to answer all your questions.</p>

                        <div className="info-items">
                            <div className="info-item">
                                <div className="info-icon"><MapPin size={20} /></div>
                                <div>
                                    <h4>Address</h4>
                                    <p>123 Custom Street, Fashion District<br/>New York, NY 10001</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon"><Phone size={20} /></div>
                                <div>
                                    <h4>Phone</h4>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon"><Mail size={20} /></div>
                                <div>
                                    <h4>Email</h4>
                                    <p>support@customwears.com</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon"><Clock size={20} /></div>
                                <div>
                                    <h4>Working Hours</h4>
                                    <p>Mon - Fri: 9:00 AM - 6:00 PM<br/>Sat: 10:00 AM - 4:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="contact-form-card">
                        <h2>Send us a Message</h2>
                        {submitted && <div className="success-msg">✅ Message sent successfully! We'll get back to you soon.</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <input required type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <input required type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <input required type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <textarea required name="message" placeholder="Your Message" rows="5" value={formData.message} onChange={handleChange}></textarea>
                            </div>
                            <button type="submit" className="send-btn">SEND MESSAGE</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
