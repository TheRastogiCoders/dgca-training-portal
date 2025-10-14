import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import { API_ENDPOINTS } from '../config/api';

const Library = () => {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CONTENT);
        const data = await response.json();
        setContent(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'notes': return '📝';
      case 'pdf': return '📄';
      case 'mcq': return '❓';
      default: return '📁';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredContent = filter === 'all' 
    ? content 
    : content.filter(item => item.type === filter);

  const contentTypes = [
    { id: 'all', label: 'All Content', icon: '📚' },
    { id: 'notes', label: 'Study Notes', icon: '📝' },
    { id: 'pdf', label: 'PDF Analysis', icon: '📄' },
    { id: 'mcq', label: 'MCQ Sets', icon: '❓' }
  ];

  // Mock data for coming soon notes
  const comingSoonNotes = [
    {
      id: 1,
      title: "Air Regulations Study Guide",
      subject: "Air Regulations",
      description: "Comprehensive guide covering all DGCA air regulations and procedures",
      icon: "✈️",
      color: "from-blue-500 to-blue-600",
      status: "Coming Soon"
    },
    {
      id: 2,
      title: "Navigation Fundamentals",
      subject: "Air Navigation", 
      description: "Essential navigation concepts including VOR, GPS, and flight planning",
      icon: "🧭",
      color: "from-green-500 to-green-600",
      status: "Coming Soon"
    },
    {
      id: 3,
      title: "Weather Patterns & Meteorology",
      subject: "Meteorology",
      description: "Understanding weather systems, clouds, and atmospheric conditions",
      icon: "🌤️",
      color: "from-purple-500 to-purple-600",
      status: "Coming Soon"
    },
    {
      id: 4,
      title: "Aircraft Systems Overview",
      subject: "Technical General",
      description: "Complete guide to aircraft engines, electrical systems, and hydraulics",
      icon: "⚙️",
      color: "from-orange-500 to-orange-600",
      status: "Coming Soon"
    },
    {
      id: 5,
      title: "Radio Telephony Procedures",
      subject: "Radio Telephony",
      description: "Standard phraseology and communication procedures for pilots",
      icon: "📻",
      color: "from-red-500 to-red-600",
      status: "Coming Soon"
    },
    {
      id: 6,
      title: "DGCA Exam Preparation",
      subject: "General",
      description: "Complete study plan and tips for DGCA examination success",
      icon: "📚",
      color: "from-indigo-500 to-indigo-600",
      status: "Coming Soon"
    }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-20 md:pb-8 md:ml-24">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 md:mb-4">
                Study Library
              </h1>
              <p className="text-base md:text-xl text-white mb-4 md:mb-6">
                Comprehensive study materials for your aviation journey
              </p>
              {content.length > 0 && (
                <div className="inline-flex items-center px-3 md:px-4 py-2 bg-green-100 border border-green-300 rounded-full">
                  <span className="text-green-800 font-medium text-xs md:text-sm">📚 {content.length} materials available!</span>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            {content.length > 0 && (
              <div className="mb-6 md:mb-8">
                <div className="grid grid-cols-2 md:flex gap-1 bg-gray-100 rounded-lg p-1">
                  {contentTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFilter(type.id)}
                      className={`py-2 md:py-3 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                        filter === type.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <span className="mr-1 md:mr-2">{type.icon}</span>
                      <span className="hidden md:inline">{type.label}</span>
                      <span className="md:hidden">{type.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-white">Loading content...</p>
                </div>
              </div>
            ) : filteredContent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                {filteredContent.map(item => (
                  <Card key={item._id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-2xl md:text-3xl mr-2 md:mr-3 flex-shrink-0">{getTypeIcon(item.type)}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 text-base md:text-lg truncate">{item.title}</h3>
                          <p className="text-xs md:text-sm text-gray-600">{item.subject?.name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)} flex-shrink-0 ml-2`}>
                        {item.difficulty}
                      </span>
                    </div>
                    
                    {item.description && (
                      <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">{item.description}</p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs md:text-sm text-gray-500 mb-3 md:mb-4 gap-1">
                      <span>By {item.uploadedBy?.username || 'Admin'}</span>
                      <span>{item.fileSize ? formatFileSize(item.fileSize) : 'N/A'}</span>
                    </div>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3 md:mb-4">
                        {item.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <a
                        href={`/api/content/${item._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium text-xs md:text-sm"
                      >
                        View Content →
                      </a>
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : content.length === 0 ? (
              <div className="text-center py-8 md:py-12 mb-8 md:mb-12">
                <div className="text-4xl md:text-6xl mb-3 md:mb-4">📚</div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">No Content Available Yet</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  Study materials will appear here once uploaded by admin.
                </p>
                <div className="bg-yellow-100 text-yellow-800 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium inline-block">
                  Content will be available soon!
                </div>
              </div>
            ) : (
              <div className="text-center py-8 md:py-12 mb-8 md:mb-12">
                <div className="text-4xl md:text-6xl mb-3 md:mb-4">🔍</div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">No Content Found</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  No {contentTypes.find(t => t.id === filter)?.label.toLowerCase()} available for this filter.
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                  View All Content
                </button>
              </div>
            )}

            {/* Coming Soon Notes Grid */}
            <div className="mb-8 md:mb-12">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
                Upcoming Study Materials
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {comingSoonNotes.map(note => (
                  <Card key={note.id} className="p-4 md:p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    {/* Coming Soon Badge */}
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                      <span className="px-2 md:px-3 py-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        Coming Soon
                      </span>
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r ${note.color} rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {note.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="mb-3 md:mb-4">
                      <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {note.title}
                      </h3>
                      <span className="inline-block px-2 md:px-3 py-1 bg-gray-100 text-gray-600 text-xs md:text-sm rounded-full font-medium">
                        {note.subject}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                      {note.description}
                    </p>
                    
                    {/* Coming Soon Button */}
                    <button 
                      disabled
                      className="w-full py-2 md:py-3 px-3 md:px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center justify-center text-sm md:text-base"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Available Soon
                    </button>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Access Section */}
            <Card className="p-4 md:p-8">
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">Quick Access</h3>
                <p className="text-sm md:text-base text-gray-600">Explore other available features</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <Link to="/question-bank" className="group">
                  <Card className="p-3 md:p-6 text-center hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                      📚
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Question Bank</h4>
                    <p className="text-xs md:text-sm text-gray-600">Practice questions</p>
                  </Card>
                </Link>
                
                <Link to="/practice-test" className="group">
                  <Card className="p-3 md:p-6 text-center hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                      🎯
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Practice Tests</h4>
                    <p className="text-xs md:text-sm text-gray-600">Mock exams</p>
                  </Card>
                </Link>
                
                <div className="group">
                  <Card className="p-3 md:p-6 text-center opacity-60">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl mx-auto mb-3 md:mb-4">
                      📖
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Study Notes</h4>
                    <p className="text-xs md:text-sm text-gray-600">Coming soon</p>
                  </Card>
                </div>
                
                <div className="group">
                  <Card className="p-3 md:p-6 text-center opacity-60">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl mx-auto mb-3 md:mb-4">
                      📋
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Regulations</h4>
                    <p className="text-xs md:text-sm text-gray-600">Coming soon</p>
                  </Card>
                </div>
              </div>
            </Card>

            {/* Newsletter Signup */}
            <Card className="p-4 md:p-8 mt-6 md:mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl mx-auto mb-4 md:mb-6">
                  📧
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                  Stay Updated!
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 max-w-2xl mx-auto">
                  Be the first to know when our comprehensive study materials are ready. 
                  Get notified about new content, updates, and exclusive learning resources.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                  <button className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm md:text-base">
                    Notify Me
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Library;