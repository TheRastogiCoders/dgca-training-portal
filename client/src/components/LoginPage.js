import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import GLOBAL_ASSETS from '../config/globalAssets';
import GoogleSignInButton from './GoogleSignInButton';
import debugLog from '../utils/debug';

const BENEFITS = [
  {
    icon: '📊',
    title: 'Track your progress',
    text: 'See your scores, weak areas, and improvement over time.',
  },
  {
    icon: '📝',
    title: 'PYQ practice & book sessions',
    text: 'Access previous year questions and chapter-wise practice.',
  },
  {
    icon: '📈',
    title: 'Performance insights',
    text: 'Detailed analytics to focus your preparation.',
  },
  {
    icon: '💾',
    title: 'Save your results',
    text: 'Review attempts and revisit questions anytime.',
  },
];

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
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else {
      const isEmail = formData.username.includes('@');
      if (isLogin) {
        if (isEmail) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
            errors.username = 'Please enter a valid email address';
          }
        } else {
          if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
          } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = 'Username can only contain letters, numbers, and underscores';
          }
        }
      } else {
        if (formData.username.length < 3) errors.username = 'Username must be at least 3 characters';
        else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) errors.username = 'Username can only contain letters, numbers, and underscores';
      }
    }
    if (!isLogin) {
      if (!formData.email.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length > 128) {
      errors.password = 'Password must be less than 128 characters';
    }
    if (!isLogin) {
      if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'password') setPasswordStrength(checkPasswordStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    if (!isLogin && passwordStrength.strength === 'weak') {
      setError('Password is too weak. Please use a stronger password.');
      return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? API_ENDPOINTS.AUTH_LOGIN : API_ENDPOINTS.AUTH_REGISTER;
      const isEmailLogin = formData.username && formData.username.includes('@');
      const body = isLogin
        ? (isEmailLogin
          ? { email: formData.username, password: formData.password }
          : { username: formData.username, password: formData.password })
        : { username: formData.username, email: formData.email, password: formData.password };
      debugLog('Making request to:', endpoint);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    } catch (err) {
      console.error('Auth error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Cannot connect to server. Please check your internet connection and try again.');
      } else if (err.message.includes('Server error:')) {
        setError(err.message);
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
    <div className="min-h-screen gradient-bg flex flex-col lg:flex-row pt-16 sm:pt-20">
      {/* Left panel: branding + benefits */}
      <div className="login-hero w-full lg:w-[44%] flex flex-col justify-center px-6 sm:px-10 py-10 lg:py-16 lg:pl-14 lg:pr-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8 lg:mb-12">
          <img src={GLOBAL_ASSETS.LOGO} alt="VIMAANNA" className="h-10 w-auto" />
          <span className="text-sm font-semibold tracking-wide">VIMAANNA</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-tight">
          DGCA exam preparation, <br className="hidden sm:block" />
          <span className="text-blue-600">one place.</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-md mb-8 lg:mb-10">
          Sign in to access PYQ practice, question banks, and study materials. Track your progress and get ready for your CPL & ATPL exams.
        </p>
        <ul className="space-y-4">
          {BENEFITS.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-slate-700 group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg group-hover:bg-blue-100 transition-colors">
                {item.icon}
              </span>
              <div>
                <span className="font-semibold text-sm sm:text-base block text-slate-900">{item.title}</span>
                <span className="text-slate-600 text-xs sm:text-sm">{item.text}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-slate-500 text-xs">
          Free to use. No credit card required.
        </p>
      </div>

      {/* Right panel: form */}
      <div className="w-full lg:w-[56%] flex items-center justify-center px-4 sm:px-6 py-8 lg:py-16 lg:pr-14">
        <div className="w-full max-w-md">
          <div className="site-card login-card p-6 sm:p-8 md:p-10 shadow-xl rounded-2xl">
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 mb-2">Wings within reach</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-600 text-sm">
                {isLogin
                  ? 'Sign in to continue your DGCA preparation'
                  : 'Join VIMAANNA and get free access to PYQ and question banks'}
              </p>
            </div>

            {/* Sign In / Sign Up toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 sm:py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLogin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 sm:py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !isLogin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  {isLogin ? 'Username or email' : 'Username'}
                </label>
                <input
                  type={isLogin && formData.username && formData.username.includes('@') ? 'email' : 'text'}
                  id="username"
                  name="username"
                  placeholder={isLogin ? 'Username or email' : 'Choose a username'}
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                    validationErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                      validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                      validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                {!isLogin && formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600">Strength:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 w-4 rounded ${
                              level <= passwordStrength.score
                                ? passwordStrength.strength === 'weak'
                                  ? 'bg-red-400'
                                  : passwordStrength.strength === 'medium'
                                  ? 'bg-yellow-400'
                                  : 'bg-green-400'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.strength === 'weak' ? 'text-red-600' :
                        passwordStrength.strength === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Use 8+ chars with upper, lower, numbers, symbols</p>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                        validationErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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

              <button
                type="submit"
                className="w-full btn-institute-primary py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-[1.01] active:scale-[0.99]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isLogin ? 'Signing in…' : 'Creating account…'}
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px bg-gray-300 flex-1" />
                <span className="text-xs text-gray-500 font-medium">Or continue with</span>
                <div className="h-px bg-gray-300 flex-1" />
              </div>
              <GoogleSignInButton onSuccess={() => navigate('/')} />

              <div className="pt-2 space-y-2">
                {isLogin ? (
                  <p className="text-sm text-gray-600">
                    New to VIMAANNA?{' '}
                    <button type="button" className="text-blue-600 font-semibold hover:underline" onClick={toggleMode}>
                      Create account
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button type="button" className="text-blue-600 font-semibold hover:underline" onClick={toggleMode}>
                      Sign in
                    </button>
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
                  <a href="mailto:contactvimaanna@gmail.com" className="text-gray-600 hover:text-gray-900 font-medium">
                    Contact support
                  </a>
                  <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">
                    Back to home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
