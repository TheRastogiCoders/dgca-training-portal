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

  // Filter definitions and derived lists
  const contentTypes = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'pdf', label: 'PDFs', icon: '📄' },
    { id: 'mcq', label: 'MCQ Sets', icon: '❓' },
  ];

  const filteredContent = content.filter(item => {
    if (filter === 'all') return true;
    return (item.type || '').toLowerCase() === filter;
  });

  // Static coming soon list (placeholder)
  const comingSoonNotes = [
    {
      id: 1,
      title: 'Air Regulations Short Notes',
      subject: 'Air Regulations',
      description: 'Concise notes covering key CAR sections and licensing rules.',
      icon: '📘',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 2,
      title: 'Meteorology Mindmaps',
      subject: 'Meteorology',
      description: 'Visual maps for systems, fronts, and weather hazards.',
      icon: '🌤️',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 3,
      title: 'Electrical Systems Cheatsheet',
      subject: 'Technical General',
      description: 'High-yield formulas and checklists for aircraft electrics.',
      icon: '🔌',
      color: 'from-teal-500 to-emerald-600',
    },
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
              <p className="text-base md:text-xl text-gray-800 mb-4 md:mb-6 bg-white/70 inline-block px-4 py-2 rounded-full shadow-sm">
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

            {/* Removed Upcoming Study Materials section */}

            {/* Removed Quick Access section */}

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