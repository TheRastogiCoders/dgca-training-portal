// Production API Configuration
const getApiBaseUrl = () => {
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    // Use environment variable if set, otherwise use your Render backend URL
    return process.env.REACT_APP_API_URL || 'https://dgca-training-portal.onrender.com';
  }
  
  // Development - use local server or environment variable
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
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
  PRACTICE_BOOKS: `${API_BASE_URL}/api/practice-books`,
  PRACTICE_QUESTIONS: (bookSlug) => `${API_BASE_URL}/api/practice-questions/${bookSlug}`,
};

// Debug logging for production
if (process.env.NODE_ENV === 'production') {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Auth Login URL:', API_ENDPOINTS.AUTH_LOGIN);
}

export default API_ENDPOINTS;