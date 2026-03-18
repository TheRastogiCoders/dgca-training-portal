import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { IconLibrary, IconTarget, IconChart, IconBook, IconClipboard } from './ui/Icons';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    subjectsStudied: 0,
    timeSpent: 0
  });

  const fetchUserResults = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.RESULTS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        calculateStats(data);
      } else {
        console.error('Failed to fetch results');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserResults();
  }, [user, navigate, fetchUserResults]);

  const calculateStats = (resultsData) => {
    if (!resultsData || resultsData.length === 0) {
      return;
    }

    const totalTests = resultsData.length;
    const totalScore = resultsData.reduce((sum, r) => sum + (r.score / r.total * 100), 0);
    const averageScore = Math.round((totalScore / totalTests) * 10) / 10;
    const bestScore = Math.max(...resultsData.map(r => Math.round((r.score / r.total) * 100)));
    const subjectsSet = new Set(resultsData.map(r => r.subject?.name || r.subjectName || 'Unknown'));
    const subjectsStudied = subjectsSet.size;
    const timeSpent = resultsData.reduce((sum, r) => sum + (r.timeSpent || 0), 0);

    setStats({
      totalTests,
      averageScore,
      bestScore,
      subjectsStudied,
      timeSpent
    });
  };

  const getUserInitials = () => {
    const name = user?.username || user?.email || 'User';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <main className="page-content flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <main className="page-content">
        <div className="page-content-inner max-w-6xl mx-auto">
            {/* Hero */}
            <section className="text-center mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-200 mb-2">Your progress</p>
              <h1 className="text-2xl md:text-4xl font-bold text-slate-900">Profile</h1>
              <p className="text-sm text-slate-500 mt-1">Wings within reach.</p>
            </section>

            {/* Profile Header */}
            <div className="site-card rounded-2xl p-6 md:p-8 mb-6 border-slate-200">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg border border-slate-200">
                  <span className="text-slate-900 text-3xl font-bold">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {user?.username || 'User'}
                  </h2>
                  <p className="text-gray-600 mb-4">{user?.email}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Member since 2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[
                { value: stats.totalTests, label: 'Tests Taken', color: 'text-blue-600' },
                { value: `${stats.averageScore}%`, label: 'Avg Score', color: 'text-green-600' },
                { value: `${stats.bestScore}%`, label: 'Best Score', color: 'text-purple-600' },
                { value: stats.subjectsStudied, label: 'Subjects', color: 'text-indigo-600' },
                { value: formatTime(stats.timeSpent), label: 'Time Spent', color: 'text-pink-600' },
              ].map((item, i) => (
                <div key={i} className="site-card rounded-2xl p-4 text-center border-slate-200">
                  <div className={`text-2xl font-bold ${item.color} mb-1`}>{item.value}</div>
                  <div className="text-xs text-gray-600 font-medium">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Mobile Logout Button - Alternative Location */}
            <div className="md:hidden mb-6">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                    navigate('/login');
                  }
                }}
                className="w-full bg-red-500/90 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-slate-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="site-card rounded-2xl p-2 mb-6 border-slate-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTab('overview')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    selectedTab === 'overview'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/20'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setSelectedTab('recent')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    selectedTab === 'recent'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/20'
                  }`}
                >
                  Recent Tests
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="site-card rounded-2xl p-6 md:p-8 border-slate-200">
              {selectedTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Learning Journey</h2>
                  
                  {stats.totalTests === 0 ? (
                    <div className="text-center py-12">
                      <div className="mb-4 text-gray-500 flex justify-center"><IconLibrary className="w-16 h-16" size="xl" /></div>
                      <p className="text-gray-600 text-lg mb-4">No tests taken yet</p>
                        <button
                        onClick={() => navigate('/pyq')}
                        className="btn-institute-primary px-6 py-3 rounded-xl font-semibold"
                      >
                        Start Your First Test
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Progress Chart */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Overall Performance</h3>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full relative overflow-hidden">
                          <div 
                            className="bg-white h-full transition-all duration-1000"
                            style={{ width: `${stats.averageScore}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-gray-600">
                          <span>Current Average</span>
                          <span>{stats.averageScore}%</span>
                        </div>
                      </div>

                      {/* Performance Insights */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-3 text-white">
                              <IconTarget className="w-6 h-6" size="md" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">Test Average</h4>
                              <p className="text-sm text-gray-600">{stats.averageScore}%</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {stats.averageScore >= 80 
                              ? 'Excellent! You\'re mastering the material.'
                              : stats.averageScore >= 60
                              ? 'Good progress! Keep practicing.'
                              : 'Keep studying to improve your score.'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-3 text-white">
                              <IconChart className="w-6 h-6" size="md" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">Best Performance</h4>
                              <p className="text-sm text-gray-600">{stats.bestScore}%</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {stats.bestScore === 100 
                              ? 'Perfect score achieved!'
                              : `${100 - stats.bestScore}% away from perfection.`}
                          </p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <button
                            onClick={() => navigate('/pyq')}
                            className="site-card border-slate-200 p-4 rounded-2xl hover:shadow-lg transition-all text-left w-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border"
                          >
                            <div className="text-gray-700 mb-2"><IconTarget className="w-8 h-8" size="lg" /></div>
                            <div className="font-semibold text-gray-900">Take a Practice Test</div>
                          </button>
                          <button
                            onClick={() => navigate('/question-bank')}
                            className="site-card border-slate-200 p-4 rounded-2xl hover:shadow-lg transition-all text-left w-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border"
                          >
                            <div className="text-gray-700 mb-2"><IconLibrary className="w-8 h-8" size="lg" /></div>
                            <div className="font-semibold text-gray-900">Question Bank</div>
                          </button>
                          <button
                            onClick={() => navigate('/library')}
                            className="site-card border-slate-200 p-4 rounded-2xl hover:shadow-lg transition-all text-left w-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border"
                          >
                            <div className="text-gray-700 mb-2"><IconBook className="w-8 h-8" size="lg" /></div>
                            <div className="font-semibold text-gray-900">Study Library</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'recent' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Tests</h2>
                  
                  {results.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mb-4 text-gray-500 flex justify-center"><IconClipboard className="w-16 h-16" size="xl" /></div>
                      <p className="text-gray-600 text-lg">No test results yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {results.slice(0, 10).map((result, index) => {
                        const percentage = Math.round((result.score / result.total) * 100);
                        const subjectName = result.subject?.name || result.subjectName || 'Unknown Subject';
                        const bookName = result.book?.name || result.book?.title || result.bookName || 'Unknown Book';
                        
                        return (
                          <div key={result._id || index} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-800">{subjectName}</h3>
                                <p className="text-sm text-gray-600">{bookName}</p>
                              </div>
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-blue-600' : 'text-red-600'}`}>
                                  {percentage}%
                                </div>
                                <div className="text-sm text-gray-600">
                                  {result.score} / {result.total}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(result.timeSpent || 0)}
                              </div>
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(result.createdAt)}
                              </div>
                            </div>
                            
                            <div className="mt-3 bg-gray-100 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

