import React, { useState } from 'react';
import './LoginModal.css';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const LoginModal = ({ onLogin, onClose }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!formData.username || !formData.password || (mode === 'signup' && !formData.email)) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const response = await fetch(API_ENDPOINTS.AUTH_REGISTER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || 'Registration failed. Please try again.');
        } else {
          setSuccess('Account created. You can now sign in.');
          setMode('login');
        }
      } 
      if (mode === 'login') {
        const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, password: formData.password }),
        });
        const data = await response.json();
        if (response.ok) {
          // Enforce: Admins must log in via /admin only
          if (data.user?.isAdmin && window.location.pathname !== '/admin') {
            setError('Admin login allowed only at /admin');
            return;
          }
          // Update global auth state immediately
          login(data.user, data.token);
          onLogin(data.user);
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-header">
          <div className="login-logo">
            <div className="logo">VA</div>
            <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="login-content">
          <div className="welcome-message">
            {mode === 'login' ? (
              <>
                <h3>Sign in to continue 📚</h3>
                <p>Access your notes, practice tests, and progress.</p>
              </>
            ) : (
              <>
                <h3>Join VIMAANNA ✈️</h3>
                <p>Create an account to save progress and practice.</p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">
                <span className="label-icon">👤</span>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                required
              />
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">📧</span>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required={mode === 'signup'}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            {success && (
              <div className="success-message">
                ✅ {success}
              </div>
            )}

            <button 
              type="submit" 
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <div className="login-help">
              <p>Need help? Contact support 📞</p>
              <p>
                {mode === 'login' ? (
                  <>New to VIMAANNA? <button className="signup-link" onClick={() => setMode('signup')}>Create Account</button></>
                ) : (
                  <>Already have an account? <button className="signup-link" onClick={() => setMode('login')}>Sign In</button></>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
