import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import { API_ENDPOINTS } from '../config/api';
import GoogleSignInButton from './GoogleSignInButton';
import debugLog from '../utils/debug';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, strength: 'weak' });
  const navigate = useNavigate();
  const { login } = useAuth();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, strength: 'weak' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    let strength = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 2) strength = 'medium';
    
    return { score, strength, checks };
  };

  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else {
      const isEmail = formData.username.includes('@');
      
      if (isLogin) {
        // During login: allow either username or email
        if (isEmail) {
          // Validate email format
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
            errors.username = 'Please enter a valid email address';
          }
        } else {
          // Validate username format
          if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
          } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = 'Username can only contain letters, numbers, and underscores';
          }
        }
      } else {
        // During registration: only allow username (not email)
        if (formData.username.length < 3) {
          errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
          errors.username = 'Username can only contain letters, numbers, and underscores';
        }
      }
    }
    
    // Email validation (only for registration)
    if (!isLogin) {
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length > 128) {
      errors.password = 'Password must be less than 128 characters';
    }
    
    // Confirm password validation (only for registration)
    if (!isLogin) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Update password strength for password field
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Additional security checks
    if (!isLogin && passwordStrength.strength === 'weak') {
      setError('Password is too weak. Please use a stronger password.');
      return;
    }
    
    setLoading(true);

    try {
      const endpoint = isLogin ? API_ENDPOINTS.AUTH_LOGIN : API_ENDPOINTS.AUTH_REGISTER;
      // Allow email login for admin or regular users
      const isEmailLogin = formData.username && formData.username.includes('@');
      const body = isLogin 
        ? (isEmailLogin 
          ? { email: formData.username, password: formData.password }
          : { username: formData.username, password: formData.password })
        : { username: formData.username, email: formData.email, password: formData.password };

      debugLog('Making request to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      debugLog('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          login(data.user, data.token);
          // Navigate to home for all users (admin or regular)
          navigate('/');
        } else {
          setError('');
          setIsLogin(true);
          setFormData({ username: '', email: '', password: '', confirmPassword: '' });
          setPasswordStrength({ score: 0, strength: 'weak' });
          alert('Registration successful! Please log in with your credentials.');
        }
      } else {
        setError(data.message || `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // More specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError('Cannot connect to server. Please check your internet connection and try again.');
      } else if (error.message.includes('Server error:')) {
        setError(error.message);
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setValidationErrors({});
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setPasswordStrength({ score: 0, strength: 'weak' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        <SiteSidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-20 md:pb-8 md:ml-56 lg:ml-64 xl:ml-72 flex items-center justify-center">
          <div className="w-full max-w-lg">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-10 border border-white/40">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <img 
                    src="/vimaanna-logo.png" 
                    alt="VIMAANNA Logo" 
                    className="h-16 md:h-20 w-auto"
                  />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                  {isLogin ? 'Welcome Back' : 'Join VIMAANNA'}
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  {isLogin 
                    ? 'Sign in to continue your aviation learning journey' 
                    : 'Create your account and start your aviation journey'
                  }
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    isLogin 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    !isLogin 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    {isLogin ? 'Username or Email *' : 'Username *'}
                  </label>
                  <input
                    type={isLogin && formData.username && formData.username.includes('@') ? 'email' : 'text'}
                    id="username"
                    name="username"
                    placeholder={isLogin ? 'Enter your username or email' : 'Enter your username'}
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      validationErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.username && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                  )}
                </div>

                {/* Email - Only for registration */}
                {!isLogin && (
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>
                )}

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                  )}
                  
                  {/* Password Strength Indicator - Only for registration */}
                  {!isLogin && formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-600">Password strength:</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => {
                            const isActive = level <= passwordStrength.score;
                            return (
                              <div
                                key={level}
                                className={`h-1 w-4 rounded ${
                                  isActive
                                    ? passwordStrength.strength === 'weak'
                                      ? 'bg-red-400'
                                      : passwordStrength.strength === 'medium'
                                      ? 'bg-yellow-400'
                                      : 'bg-green-400'
                                    : 'bg-gray-200'
                                }`}
                              />
                            );
                          })}
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength.strength === 'weak'
                            ? 'text-red-600'
                            : passwordStrength.strength === 'medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                          {passwordStrength.strength}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Use 8+ characters with uppercase, lowercase, numbers, and symbols
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password - Only for registration */}
                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          validationErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-3">
                {/* Or divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="h-px bg-gray-200 flex-1" />
                  <span className="text-xs text-gray-400">OR</span>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>
                <GoogleSignInButton onSuccess={() => navigate('/')} />

                {isLogin ? (
                  <>
                    <p className="text-sm text-gray-600">
                      New to VIMAANNA? 
                      <button 
                        className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
                        onClick={toggleMode}
                      >
                        Create Account
                      </button>
                    </p>
                    <div className="flex justify-center space-x-4">
                      <span className="text-gray-300">•</span>
                      <a href="mailto:contactvimaanna@gmail.com" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Contact Support
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      Already have an account? 
                      <button 
                        className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
                        onClick={toggleMode}
                      >
                        Sign In
                      </button>
                    </p>
                    <div className="flex justify-center space-x-4">
                      <a href="mailto:contactvimaanna@gmail.com" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Contact Support
                      </a>
                      <span className="text-gray-300">•</span>
                      <Link to="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Back to Home
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;