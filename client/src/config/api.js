import debugLog from '../utils/debug';

// Production API Configuration
const getApiBaseUrl = () => {
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    // Use environment variable if set, otherwise use your Render backend URL
    return process.env.REACT_APP_API_URL || 'https://dgca-training-portal.onrender.com';
  }
  
  // Development - use proxy if available, otherwise explicit URL
  // The proxy in package.json points to http://localhost:5000
  // If REACT_APP_API_URL is set, use it; otherwise use empty string for proxy
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Use proxy (empty string means use relative URLs which will be proxied)
  // But for explicit API calls, we need the full URL
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  AI_CHAT: `${API_BASE_URL}/api/ai/chat`,
  CONTENT: `${API_BASE_URL}/api/content`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_GOOGLE: `${API_BASE_URL}/api/auth/google`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ADMIN_LOGOUT: `${API_BASE_URL}/api/admin/logout`,
  QUESTIONS: `${API_BASE_URL}/api/questions`,
  RESULTS: `${API_BASE_URL}/api/results`,
  USERS: `${API_BASE_URL}/api/admin/users`,
  SUBJECTS: `${API_BASE_URL}/api/subjects`,
  NOTES: `${API_BASE_URL}/api/notes`,
  REPORTS: `${API_BASE_URL}/api/reports`,
  PRACTICE_BOOKS: `${API_BASE_URL}/api/practice-books`,
  PRACTICE_QUESTIONS: (bookSlug) => `${API_BASE_URL}/api/practice-questions/${bookSlug}`,
  SEARCH_SUGGEST: `${API_BASE_URL}/api/search/suggest`,
  SEARCH_ASK: `${API_BASE_URL}/api/search/ask`,
};

// Debug logging only outside production
if (process.env.NODE_ENV !== 'production') {
  debugLog('API Base URL:', API_BASE_URL);
  debugLog('Auth Login URL:', API_ENDPOINTS.AUTH_LOGIN);
}

export default API_ENDPOINTS;