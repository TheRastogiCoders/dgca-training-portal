const AdminDomainGuard = ({ children }) => {
  const allowed = process.env.REACT_APP_ADMIN_HOST;
  if (!allowed) return children; // no guard configured
  const host = window.location.host || '';
  if (!host.startsWith(allowed)) {
    // Not on admin host: bounce to home
    window.location.href = '/';
    return null;
  }
  return children;
};

export default AdminDomainGuard;


