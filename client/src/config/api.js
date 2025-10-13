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
  SUBJECTS: `${API_BASE_URL}/api/subjects`,
  NOTES: `${API_BASE_URL}/api/notes`,
  PRACTICE_BOOKS: `${API_BASE_URL}/api/practice-books`,
  PRACTICE_QUESTIONS: (bookSlug) => `${API_BASE_URL}/api/practice-questions/${bookSlug}`,
};

export default API_ENDPOINTS;
