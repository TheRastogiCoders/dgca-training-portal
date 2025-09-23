import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteSidebar from '../SiteSidebar';
import Card from '../ui/Card';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_ENDPOINTS } from '../../config/api';

const AdminUsers = () => {
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, admins: 0, regular: 0 });
  const pageSize = 10;

  // Redirect if not admin authenticated
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USERS, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
        // Calculate stats
        const admins = data.filter(u => u.isAdmin).length;
        const regular = data.filter(u => !u.isAdmin).length;
        setStats({ total: data.length, admins, regular });
      } else {
        setError('Failed to load users');
      }
    } catch (e) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setRole = async (id, isAdmin) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_ENDPOINTS.USERS}/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isAdmin })
      });
      if (!res.ok) throw new Error('Failed');
      // Update locally for snappy UX
      setUsers(prev => prev.map(u => (u._id === id ? { ...u, isAdmin } : u)));
    } catch {
      alert('Failed to update role');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_ENDPOINTS.USERS}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      await load();
    } catch {
      alert('Failed to delete user');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [users, query]);

  const paged = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    setPages(totalPages);
    const current = Math.min(page, totalPages);
    const start = (current - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                <Link to="/admin-dashboard" className="text-blue-600 hover:text-blue-700">Dashboard</Link>
                <span className="mx-2">/</span>
                <span>Users</span>
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4">
                User Management
              </h1>
              <p className="text-base md:text-xl text-gray-600">
                Manage user accounts and permissions
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <Card className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-2 md:p-3 rounded-lg text-blue-600 bg-blue-100">
                    <span className="text-xl md:text-2xl">👥</span>
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Total Users</div>
              </Card>
              
              <Card className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-2 md:p-3 rounded-lg text-red-600 bg-red-100">
                    <span className="text-xl md:text-2xl">👑</span>
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stats.admins}</div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Admins</div>
              </Card>
              
              <Card className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-2 md:p-3 rounded-lg text-green-600 bg-green-100">
                    <span className="text-xl md:text-2xl">👤</span>
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stats.regular}</div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Regular Users</div>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="p-4 md:p-6 mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Search Users</h3>
                <button 
                  onClick={load}
                  className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              <div className="max-w-md">
                <input 
                  value={query} 
                  onChange={e => { setQuery(e.target.value); setPage(1); }} 
                  placeholder="Search by username or email..." 
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                />
              </div>
            </Card>

            {/* Users List */}
            <Card className="p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">All Users</h3>

              {loading ? (
                <div className="flex items-center justify-center py-8 md:py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-3 md:mb-4"></div>
                    <p className="text-sm md:text-base text-gray-600">Loading users...</p>
                  </div>
                </div>
              ) : paged.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="text-4xl md:text-6xl mb-3 md:mb-4">👥</div>
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-sm md:text-base text-gray-600">
                    {query ? 'Try adjusting your search terms.' : 'No users have registered yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {paged.map(user => (
                    <div key={user._id} className="p-4 md:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                            user.isAdmin 
                              ? 'bg-gradient-to-br from-red-500 to-pink-600' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                            <span className="text-white font-semibold text-sm md:text-lg">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 flex items-center text-sm md:text-base">
                              <span className="truncate">{user.username}</span>
                              {user.isAdmin && (
                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex-shrink-0">
                                  Admin
                                </span>
                              )}
                            </h4>
                            <p className="text-xs md:text-sm text-gray-600 truncate">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          <button
                            onClick={() => setRole(user._id, !user.isAdmin)}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                              user.isAdmin
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {user.isAdmin ? 'Demote to User' : 'Promote to Admin'}
                          </button>
                          <button
                            onClick={() => remove(user._id)}
                            className="px-3 md:px-4 py-1.5 md:py-2 bg-red-100 text-red-700 rounded-lg text-xs md:text-sm font-medium hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && (
                <div className="mt-6 md:mt-8 flex items-center justify-center space-x-1 md:space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-3 md:px-4 py-1.5 md:py-2 text-gray-700 text-xs md:text-sm">
                    Page {page} of {pages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pages}
                    className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;


