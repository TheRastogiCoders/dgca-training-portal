import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminResults = () => {
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [subject, setSubject] = useState('');
  const [user, setUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, totalTests: 0 });

  // Redirect if not admin authenticated
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '20');
      if (subject) params.set('subject', subject);
      if (user) params.set('user', user);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/results?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setItems(data.items || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      
      // Calculate stats
      const total = data.items?.length || 0;
      const avgScore = data.items?.length > 0 
        ? Math.round(data.items.reduce((sum, item) => sum + (item.score / Math.max(1, item.total)) * 100, 0) / data.items.length)
        : 0;
      setStats({ total, avgScore, totalTests: data.total || 0 });
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const applyFilters = (e) => {
    e.preventDefault();
    load(1);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Link to="/admin-dashboard" className="text-blue-600 hover:text-blue-700">Dashboard</Link>
                <span className="mx-2">/</span>
                <span>Results</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Test Results
              </h1>
              <p className="text-xl text-gray-600">
                Monitor user performance and test analytics
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg text-blue-600 bg-blue-100">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalTests}</div>
                <div className="text-gray-600 font-medium">Total Tests</div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg text-green-600 bg-green-100">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.avgScore}%</div>
                <div className="text-gray-600 font-medium">Average Score</div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg text-purple-600 bg-purple-100">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                <div className="text-gray-600 font-medium">Recent Results</div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              <form onSubmit={applyFilters} className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject ID</label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Filter by Subject ID" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Filter by User ID" 
                    value={user} 
                    onChange={e => setUser(e.target.value)} 
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit"
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </Card>

            {/* Results List */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Test Results</h3>
                <button 
                  onClick={() => load(page)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading results...</p>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">Try adjusting your filters or check back later.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((result) => {
                    const score = Math.round((result.score / Math.max(1, result.total)) * 100);
                    return (
                      <div key={result._id} className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {(result.user?.username || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{result.user?.username || 'Unknown User'}</h4>
                              <p className="text-sm text-gray-600">
                                {result.subject?.name || result.subjectName || 'Unknown Subject'} • 
                                {result.book?.title || result.bookName || 'Unknown Book'}
                                {result.chapterName && ` • ${result.chapterName}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}>
                              {score}%
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {result.score}/{result.total} questions
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {result.timeSpent ? `${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s` : 'N/A'}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {formatTimeAgo(result.createdAt)}
                            </span>
                            <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                              {result.testType === 'ai' ? 'AI Practice' : result.testType === 'admin' ? 'Admin Analysis' : 'Book Questions'}
                            </span>
                          </div>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && (
                <div className="mt-8 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => load(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {page} of {pages}
                  </span>
                  <button
                    onClick={() => load(page + 1)}
                    disabled={page === pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AdminResults;


