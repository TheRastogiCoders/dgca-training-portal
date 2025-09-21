const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const API_ENDPOINTS = {
  AI_CHAT: `${API_BASE_URL}/api/ai/chat`,
  CONTENT: `${API_BASE_URL}/api/content`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ADMIN_LOGOUT: `${API_BASE_URL}/api/admin/logout`,
  QUESTIONS: `${API_BASE_URL}/api/questions`,
  RESULTS: `${API_BASE_URL}/api/results`,
  USERS: `${API_BASE_URL}/api/admin/users`,
};

export default API_ENDPOINTS;
