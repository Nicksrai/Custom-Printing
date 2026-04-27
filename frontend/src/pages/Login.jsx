import React, { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegister) {
                await api.post('/auth/register', formData);
                // Switch to login tab softly
                setIsRegister(false);
                alert("Registration successful, please login.");
            } else {
                // OAuth2 required format
                const formBody = new URLSearchParams();
                formBody.append('username', formData.email);
                formBody.append('password', formData.password);
                
                const response = await api.post('/auth/login', formBody);
                login(response.data.access_token);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    {isRegister && (
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    
                    <button type="submit" className="primary-btn">
                        {isRegister ? 'Register' : 'Login'}
                    </button>
                </form>

                <p className="toggle-text">
                    {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                    <span onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? 'Login here' : 'Register here'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
