// no React import required in modern bundlers for JSX

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');

  if (!token || !userRaw) {
    window.location.href = '/admin';
    return null;
  }

  try {
    const user = JSON.parse(userRaw);
    if (!user.isAdmin) {
      window.location.href = '/admin';
      return null;
    }
  } catch (e) {
    window.location.href = '/admin';
    return null;
  }

  return children;
};

export default ProtectedRoute;


