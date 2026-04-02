import React, { useEffect, useState } from 'react';
import Card from './ui/Card';
import { API_ENDPOINTS } from '../config/api';
import { IconLibrary, IconPencil, IconDocument, IconQuestion, IconFolder, IconSearch, IconEmail } from './ui/Icons';

const Library = () => {
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
    switch ((type || '').toLowerCase()) {
      case 'notes': return IconPencil;
      case 'pdf': return IconDocument;
      case 'mcq': return IconQuestion;
      default: return IconFolder;
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

  const contentTypes = [
    { id: 'all', label: 'All', Icon: IconLibrary },
    { id: 'notes', label: 'Notes', Icon: IconPencil },
    { id: 'pdf', label: 'PDFs', Icon: IconDocument },
    { id: 'mcq', label: 'MCQ Sets', Icon: IconQuestion },
  ];

  const filteredContent = content.filter(item => {
    if (filter === 'all') return true;
    return (item.type || '').toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen gradient-bg">
      <main className="page-content">
        <div className="page-content-inner max-w-6xl mx-auto">
            {/* Hero */}
            <section className="text-center mb-10 md:mb-14">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 mb-3">Resources</p>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                Study Library
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium mb-4">
                Notes, PDFs, and study materials - organized for your DGCA preparation.
              </p>
              <p className="text-sm text-slate-500 mb-4">Wings within reach.</p>
              {content.length > 0 && (
                <div className="inline-flex items-center px-3 md:px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                  <span className="text-blue-700 font-medium text-xs md:text-sm inline-flex items-center gap-1.5"><IconLibrary className="w-4 h-4" size="sm" /> {content.length} materials available</span>
                </div>
              )}
            </section>

            {/* Filter Tabs */}
            {content.length > 0 && (
              <div className="mb-6 md:mb-8">
                <div className="grid grid-cols-2 md:flex gap-1 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm">
                  {contentTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFilter(type.id)}
                      className={`py-2 md:py-3 px-2 md:px-4 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 inline-flex items-center ${
                        filter === type.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="mr-1 md:mr-2 flex-shrink-0">{type.Icon && <type.Icon className="w-4 h-4" size="sm" />}</span>
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
                  <p className="text-slate-600">Loading content...</p>
                </div>
              </div>
            ) : filteredContent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                {filteredContent.map(item => {
                  const TypeIcon = getTypeIcon(item.type);
                  return (
                  <Card key={item._id} className="site-card p-4 md:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-gray-700 mr-2 md:mr-3 flex-shrink-0">{TypeIcon && <TypeIcon className="w-8 h-8 md:w-9 md:h-9" size="lg" />}</span>
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
                );})}
              </div>
            ) : content.length === 0 ? (
              <div className="site-card text-center py-10 md:py-14 mb-8 md:mb-12 px-6">
                <div className="mb-4 text-gray-500 flex justify-center"><IconLibrary className="w-16 h-16 md:w-20 md:h-20" size="xl" /></div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">No Content Available Yet</h3>
                <p className="text-gray-600 mb-4">We’re adding study materials soon. Check back or reach out for updates.</p>
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm font-medium text-blue-800">
                  Content will be available soon!
                </div>
              </div>
            ) : (
              <div className="site-card text-center py-10 md:py-14 mb-8 md:mb-12 px-6">
                <div className="mb-4 text-gray-500 flex justify-center"><IconSearch className="w-16 h-16 md:w-20 md:h-20" size="xl" /></div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">No Content Found</h3>
                <p className="text-gray-600 mb-6">
                  No {contentTypes.find(t => t.id === filter)?.label.toLowerCase()} available for this filter.
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="btn-institute-primary px-4 py-2 rounded-xl text-sm"
                >
                  View All Content
                </button>
              </div>
            )}

            {/* Removed Upcoming Study Materials section */}

            {/* Removed Quick Access section */}

            {/* Stay Updated */}
            <section className="site-card-glass p-6 md:p-10 mt-8 md:mt-12">
              <div className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                  <IconEmail className="w-8 h-8 md:w-9 md:h-9" size="lg" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Stay Updated
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-6 max-w-xl mx-auto">
                  Get notified about new study materials, updates, and learning resources. Quality preparation, zero cost.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                  <button type="button" className="btn-institute-primary px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap">
                    Notify Me
                  </button>
                </div>
              </div>
            </section>
        </div>
      </main>
    </div>
  );
};

export default Library;