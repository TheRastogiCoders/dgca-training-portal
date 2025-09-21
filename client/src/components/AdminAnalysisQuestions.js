import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminAnalysisQuestions = () => {
  const { isAdminAuthenticated } = useAdminAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('/api/content?type=pdf');
        const data = await response.json();
        setContent(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading PDF content:', error);
        setError('Failed to load PDF content');
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const openPDF = (contentId) => {
    setSelectedContent(contentId);
    // Open PDF in a new tab
    window.open(`/api/content/${contentId}`, '_blank');
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
                  <p className="text-gray-600">Loading PDF content...</p>
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
              <div className="flex items-center text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
                <span className="mx-2">/</span>
                <span>Admin Analysis Questions</span>
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4">
                Admin Analysis Questions
              </h1>
              <p className="text-base md:text-xl text-gray-600">
                View and analyze PDF content for question preparation
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

            {/* PDF Content Grid */}
            {content.length === 0 ? (
              <Card className="p-8 md:p-12 text-center">
                <div className="text-4xl md:text-6xl mb-3 md:mb-4">📄</div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">No PDF Content Available</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  No PDF files have been uploaded for analysis yet.
                </p>
                <div className="bg-yellow-100 text-yellow-800 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium inline-block">
                  PDFs will appear here once uploaded by admin
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {content.map(item => (
                  <Card key={item._id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-2xl md:text-3xl mr-2 md:mr-3 flex-shrink-0">📄</span>
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
                      <button
                        onClick={() => openPDF(item._id)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-xs md:text-sm flex items-center"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View PDF
                      </button>
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Instructions */}
            <Card className="p-4 md:p-6 mt-6 md:mt-8 bg-blue-50 border border-blue-200">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                How to Use Admin Analysis Questions
              </h3>
              <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-700">
                <div className="flex items-start">
                  <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 md:mr-3 mt-0.5 flex-shrink-0">1</span>
                  <p>Click "View PDF" to open the PDF content in a new tab for analysis</p>
                </div>
                <div className="flex items-start">
                  <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 md:mr-3 mt-0.5 flex-shrink-0">2</span>
                  <p>Review the PDF content to understand the material and identify potential questions</p>
                </div>
                <div className="flex items-start">
                  <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 md:mr-3 mt-0.5 flex-shrink-0">3</span>
                  <p>Use the content to create questions in the Admin Questions section</p>
                </div>
                <div className="flex items-start">
                  <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 md:mr-3 mt-0.5 flex-shrink-0">4</span>
                  <p>PDFs are view-only and cannot be downloaded to protect content</p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAnalysisQuestions;