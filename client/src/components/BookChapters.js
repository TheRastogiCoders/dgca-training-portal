import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import { resolveChapterSlug } from '../utils/chapterSlug';
import debugLog from '../utils/debug';
import { API_ENDPOINTS } from '../config/api';

const friendly = (slug) => (slug || '')
  .split('-')
  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
  .join(' ');

// Subject data matching QuestionBank structure
const subjectData = {
  'air-regulations': {
    title: 'Air Regulations',
    icon: '📋',
    description: 'Civil Aviation Rules & Regulations',
    color: 'from-blue-500 to-blue-600'
  },
  'air-navigation': {
    title: 'Air Navigation',
    icon: '🧭',
    description: 'Navigation Systems & Procedures',
    color: 'from-green-500 to-green-600'
  },
  'meteorology': {
    title: 'Meteorology',
    icon: '🌤️',
    description: 'Weather Systems & Aviation Weather',
    color: 'from-yellow-500 to-orange-500'
  },
  'technical-general': {
    title: 'Technical General',
    icon: '⚙️',
    description: 'Aircraft Systems & General Knowledge',
    color: 'from-red-500 to-red-600'
  },
  'technical-specific': {
    title: 'Technical Specific',
    icon: '✈️',
    description: 'Aircraft Type Specific Knowledge',
    color: 'from-purple-500 to-purple-600'
  },
  'radio-telephony': {
    title: 'Radio Telephony (RTR)-A',
    icon: '🎧',
    description: 'Radio Communication Procedures',
    color: 'from-cyan-500 to-cyan-600'
  }
};

const BookChapters = () => {
  const { subjectSlug, bookSlug } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!bookSlug) {
      console.error('No bookSlug provided');
      setError('No book selected');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const encodedSlug = encodeURIComponent(bookSlug);
      const primaryUrl = `${API_ENDPOINTS.PRACTICE_BOOKS}/${encodedSlug}/chapters`;
      const fallbackUrl = `/api/practice-books/${encodedSlug}/chapters`;

      const attemptFetch = async (url, label) => {
        debugLog(`[Frontend] Loading chapters (${label}) → ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new Error(`(${label}) Failed to load chapters (${response.status}): ${errorText || 'Unknown error'}`);
        }

        return response.json();
      };

      let data;
      try {
        data = await attemptFetch(primaryUrl, 'primary');
      } catch (primaryErr) {
        debugLog('[Frontend] Primary chapters request failed, trying fallback', primaryErr);
        data = await attemptFetch(fallbackUrl, 'fallback');
      }
      console.log('Chapters API response:', data);
      
      if (!data || !data.chapters) {
        throw new Error('Invalid response format: missing chapters data');
      }
      
      let list = [];
      if (Array.isArray(data.chapters)) {
        list = data.chapters;
      } else if (data.chapters && typeof data.chapters === 'object') {
        list = Object.values(data.chapters);
      } else {
        console.warn('Unexpected chapters format:', data.chapters);
        list = [];
      }
      
      console.log('Processed chapters list:', list);
      
      const mappedChapters = list.map((ch, index) => {
        try {
          const title = ch.title || ch.name || `Chapter ${index + 1}`;
          const slug = ch.slug || ch.id || title.toLowerCase().replace(/\s+/g, '-');
          const questionCount = Number(ch.questionCount) || 0;
          
          return {
            id: ch.id || `ch-${index + 1}`,
            title: title,
            questionCount: questionCount,
            chapterSlug: slug,
            hasQuestions: questionCount > 0
          };
        } catch (err) {
          console.error('Error processing chapter:', ch, err);
          return null;
        }
      }).filter(Boolean); // Remove any null entries from mapping errors
      
      if (mappedChapters.length === 0) {
        console.warn('No valid chapters found in response');
        setError('No chapters available for this book');
      } else {
        setChapters(mappedChapters);
      }
      
    } catch (error) {
      console.error('Error in load function:', error);
      setError(error.message || 'Failed to load chapters. Please try again.');
      setChapters([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [bookSlug]);

  const handleRefresh = () => {
    load();
  };

  const subject = subjectData[subjectSlug] || {
    title: friendly(subjectSlug),
    icon: '📚',
    description: '',
    color: 'from-gray-500 to-gray-600'
  };
  
  const book = {
    title: friendly(bookSlug),
    icon: '📖',
    description: 'CPL/ATPL Ground Training Series',
    color: 'from-blue-500 to-blue-600'
  };

  const startChapter = (chapter) => {
    const resolvedSlug = resolveChapterSlug(bookSlug, chapter?.chapterSlug || '');
    
    // For mass-and-balance book, ensure we use the correct book slug for API routing
    let actualBookSlug = bookSlug;
    if ((subjectSlug === 'performance' || subjectSlug === 'mass-and-balance') && bookSlug === 'mass-and-balance-and-performance') {
      actualBookSlug = 'mass-and-balance-and-performance';
    }
    
    // Log the generated URL for debugging the navigation issue
    debugLog(`Attempting to navigate to: /pyq/book/${actualBookSlug}/${resolvedSlug}`);
    
    navigate(`/pyq/book/${actualBookSlug}/${resolvedSlug}`);
  };

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center">
        <Header />
        <SiteSidebar />
        <div className="w-full flex justify-center">
          <main className="w-full max-w-6xl p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading chapters</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={load}
                      className="bg-red-50 text-sm font-medium text-red-700 hover:text-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center">
        <Header />
        <SiteSidebar />
        <div className="w-full flex justify-center">
          <main className="w-full max-w-6xl p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading {book.title} chapters...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait while we load the content</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center">
      <Header />
      <SiteSidebar />
      <div className="w-full flex justify-center">
        <main className="w-full max-w-6xl p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-3xl text-center mb-8">
              <button 
                onClick={() => navigate('/question-bank')}
                className="text-blue-600 hover:underline inline-flex items-center cursor-pointer bg-transparent border-none p-0 mx-auto"
              >
                <span className="mr-1">←</span> Back to {subject.title} Books
              </button>
              
              <div className={`w-20 h-20 bg-gradient-to-r ${subject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto my-6`}>
                {subject.icon}
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{subject.title}</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{subject.description}</p>
              
              <div className="flex items-center justify-center mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-sm">
                <div className={`w-12 h-12 bg-gradient-to-r ${book.color} rounded-xl flex items-center justify-center text-white text-2xl mr-4`}>
                  {book.icon}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold text-gray-900">
                    {book.title}
                    {chapters.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({chapters.length} chapters)
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{book.description}</p>
                </div>
              </div>
            </div>
            
            {chapters.length === 0 ? (
              <div className="text-center py-12 w-full max-w-2xl mx-auto">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        No chapters found for {book.title}.
                        <button 
                          onClick={load}
                          className="ml-2 text-sm font-medium text-yellow-700 underline hover:text-yellow-600"
                        >
                          Try again
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Book ID: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{bookSlug}</code> | 
                  Subject: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{subject.title}</code>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {chapters.map((ch) => {
                  const hasQuestions = ch.questionCount > 0;
                  
                  if (!hasQuestions) {
                    return (
                      <Card 
                        key={ch.id}
                        className="p-6 bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-slate-200 rounded-2xl hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="mb-4">
                            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{ch.title}</h3>
                          
                          <div className="flex items-center justify-center mb-4">
                            <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full">
                              📋 Chapter overview
                            </span>
                          </div>
                          
                          <p className="text-center text-slate-600 text-sm leading-relaxed">
                            This chapter does not include questions.
                          </p>
                        </div>
                      </Card>
                    );
                  }
                  
                  return (
                    <Card 
                      key={ch.id} 
                      className="p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{ch.title}</h3>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              {ch.questionCount} questions
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={() => startChapter(ch)}
                          className={`w-full py-3 px-6 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform bg-gradient-to-r ${book.color} text-white hover:shadow-lg hover:scale-[1.02] ${bookSlug === 'rk-bali' ? 'focus:ring-emerald-500' : 'focus:ring-blue-500'}`}
                          title={`Practice with ${book.title}`}
                        >
                          <div className="flex items-center justify-center">
                            <span className="mr-2">{book.icon}</span>
                            Start Practice
                          </div>
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookChapters;