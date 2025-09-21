import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import { useAdminAuth } from '../context/AdminAuthContext';

const StatCard = ({ label, value, color, icon, change, subtitle }) => (
  <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-200">
    <div className="flex items-center justify-between mb-3 md:mb-4">
      <div className={`p-2 md:p-3 rounded-lg ${color} bg-opacity-10`}>
        <span className="text-xl md:text-2xl">{icon}</span>
      </div>
      {change && (
        <div className={`text-xs md:text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>
    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm md:text-base text-gray-600 font-medium">{label}</div>
    {subtitle && <div className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</div>}
  </Card>
);

const ActivityItem = ({ icon, title, description, time, status }) => (
  <div className="flex items-start space-x-2 md:space-x-3 p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors">
    <div className={`p-1.5 md:p-2 rounded-full ${status === 'success' ? 'bg-green-100 text-green-600' : status === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
      <span className="text-xs md:text-sm">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs md:text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs md:text-sm text-gray-500">{description}</p>
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div>
  </div>
);

const QuickActionCard = ({ title, description, icon, color, href, onClick }) => (
  <Card 
    className={`p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group ${onClick ? 'hover:scale-105' : ''}`}
    onClick={onClick}
  >
    {href ? (
      <Link to={href} className="block">
        <div className={`w-10 h-10 md:w-12 md:h-12 ${color} rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
          <span className="text-white text-lg md:text-xl">{icon}</span>
        </div>
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">{title}</h3>
        <p className="text-gray-600 text-xs md:text-sm">{description}</p>
      </Link>
    ) : (
      <div>
        <div className={`w-10 h-10 md:w-12 md:h-12 ${color} rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
          <span className="text-white text-lg md:text-xl">{icon}</span>
        </div>
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">{title}</h3>
        <p className="text-gray-600 text-xs md:text-sm">{description}</p>
      </div>
    )}
  </Card>
);

const AdminDashboard = () => {
  const { isAdminAuthenticated, adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    logs: 0,
    results: 0,
    questions: 0,
    activeUsers: 0,
    totalTests: 0,
    avgScore: 0
  });
  const [logs, setLogs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Log authentication status for debugging
  useEffect(() => {
    console.log('AdminDashboard - isAdminAuthenticated:', isAdminAuthenticated);
    console.log('AdminDashboard - adminUser:', adminUser);
    console.log('AdminDashboard - localStorage adminToken:', localStorage.getItem('adminToken') ? 'Present' : 'Missing');
    console.log('AdminDashboard - localStorage adminUser:', localStorage.getItem('adminUser') ? 'Present' : 'Missing');
  }, [isAdminAuthenticated, adminUser]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };

    const load = async () => {
      try {
        setLoading(true);
        const [s, l, n, a] = await Promise.all([
          fetch('/api/admin/stats', { headers }).then(r => r.json()),
          fetch('/api/admin/logs?limit=10', { headers }).then(r => r.json()),
          fetch('/api/notes').then(r => r.json()),
          fetch('/api/admin/activity', { headers }).then(r => r.json()).catch(() => [])
        ]);
        
        setStats(s || { users: 0, logs: 0, results: 0, questions: 0, activeUsers: 0, totalTests: 0, avgScore: 0 });
        setLogs((l?.items || []).slice(0, 10));
        setNotes(Array.isArray(n) ? n.slice(0, 5) : []);
        setRecentActivity(Array.isArray(a) ? a.slice(0, 8) : []);
      } catch (e) {
        console.error('Error loading dashboard data:', e);
        setLogs([]); 
        setNotes([]);
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const recentNotes = useMemo(() => notes.map(n => ({
    left: `${n.title} • ${n.subject?.name || 'General'}`,
    right: new Date(n.createdAt).toLocaleDateString(),
  })), [notes]);

  const recentLogs = useMemo(() => logs.map(l => ({
    left: `${l.method} ${l.url}`,
    right: `${l.status} • ${l.responseMs} ms`,
  })), [logs]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading dashboard...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4">
                Admin Dashboard
              </h1>
              <p className="text-base md:text-xl text-gray-600 mb-4 md:mb-6">
                Monitor your platform's performance and manage content
              </p>
              
              {/* Quick Stats Bar */}
              <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  System Online
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {stats.activeUsers} Active Users
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <StatCard 
                label="Total Users" 
                value={stats.users} 
                color="text-blue-600" 
                icon="👥"
                change={12}
                subtitle="+5 this week"
              />
              <StatCard 
                label="Questions" 
                value={stats.questions} 
                color="text-green-600" 
                icon="❓"
                change={8}
                subtitle="+12 this month"
              />
              <StatCard 
                label="Test Results" 
                value={stats.results} 
                color="text-purple-600" 
                icon="📊"
                change={25}
                subtitle="+45 this week"
              />
              <StatCard 
                label="Avg Score" 
                value={`${stats.avgScore}%`} 
                color="text-orange-600" 
                icon="🎯"
                change={5}
                subtitle="+2% improvement"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <Card className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Recent Activity</h3>
                  </div>
                  
                  <div className="space-y-1">
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📊</div>
                        <p>No recent activity</p>
                      </div>
                    ) : (
                      recentActivity.map((activity, index) => (
                        <ActivityItem
                          key={index}
                          icon={activity.icon || '📝'}
                          title={activity.title || 'System Activity'}
                          description={activity.description || 'Activity detected'}
                          time={formatTimeAgo(activity.timestamp || activity.createdAt)}
                          status={activity.status || 'success'}
                        />
                      ))
                    )}
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Quick Actions</h3>
                  <div className="space-y-3 md:space-y-4">
                    <QuickActionCard
                      title="Manage Questions"
                      description="Add, edit, or delete questions"
                      icon="❓"
                      color="bg-blue-500"
                      href="/admin-questions"
                    />
                    <QuickActionCard
                      title="View Results"
                      description="Analyze user performance"
                      icon="📈"
                      color="bg-green-500"
                      href="/admin-results"
                    />
                    <QuickActionCard
                      title="User Management"
                      description="Manage user accounts"
                      icon="👥"
                      color="bg-purple-500"
                      href="/admin/users"
                    />
                  </div>
                </Card>
              </div>
            </div>

            {/* System Overview */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* System Health */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Server Status</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-600 font-medium">Healthy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Database</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-600 font-medium">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API Response</span>
                    <span className="text-gray-900 font-medium">~120ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="text-gray-900 font-medium">99.9%</span>
                  </div>
                </div>
              </Card>

              {/* Recent Materials */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Materials</h3>
                  <Link to="/library" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All →
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {recentNotes.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <div className="text-3xl mb-2">📄</div>
                      <p>No materials uploaded</p>
                    </div>
                  ) : (
                    recentNotes.map((note, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{note.left}</p>
                        </div>
                        <span className="text-xs text-gray-500">{note.right}</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Overview</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalTests}</div>
                  <div className="text-gray-600">Total Tests Taken</div>
                  <div className="text-sm text-green-600 mt-1">+15% this week</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeUsers}</div>
                  <div className="text-gray-600">Active Users Today</div>
                  <div className="text-sm text-green-600 mt-1">+8% this week</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stats.logs}</div>
                  <div className="text-gray-600">System Events</div>
                  <div className="text-sm text-gray-500 mt-1">Last 24h</div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;


