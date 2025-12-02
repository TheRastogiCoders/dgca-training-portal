import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import { resolveChapterSlug } from '../utils/chapterSlug';
import debugLog from '../utils/debug';

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

  const load = async () => {
    if (!bookSlug) return;
    setIsLoading(true);
    try {
      debugLog('Loading chapters from /api/practice-books/:book/chapters');
      const res = await fetch(`/api/practice-books/${encodeURIComponent(bookSlug)}/chapters`);
      if (!res.ok) {
        throw new Error(`Failed to load chapters (${res.status})`);
      }
      const data = await res.json();
      const list = Array.isArray(data.chapters) ? data.chapters : [];
      setChapters(list.map((ch, index) => ({
        id: ch.id || String(index + 1),
        title: ch.title,
        questionCount: ch.questionCount || 0,
        chapterSlug: ch.slug,
      })));
    } catch (error) {
      debugLog('Error loading dynamic chapters:', error);
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
              </h3>
              <p className="text-sm text-gray-600">{book.description}</p>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Loading chapters...</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 max-w-md mx-auto">
              <p className="font-bold">No chapters found</p>
              <p className="text-sm">We couldn't load any chapters for this book.</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center mx-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            <p className="text-sm text-gray-500 mt-4">Subject: {subject.title}, Book: {book.title}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
            {chapters.map((ch) => {
              const hasQuestions = ch.questionCount > 0;
              
              // Return chapter overview card for chapters without questions
              if (!hasQuestions) {
                return (
                  <Card 
                    key={ch.id}
                    className="p-6 bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-slate-200 rounded-2xl hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col items-center justify-center py-8">
                      {/* Chapter overview icon */}
                      <div className="mb-4">
                        <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      
                      {/* Chapter title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{ch.title}</h3>
                      
                      {/* Chapter overview label */}
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full">
                          📋 Chapter overview
                        </span>
                      </div>
                      
                      {/* Description */}
                      <p className="text-center text-slate-600 text-sm leading-relaxed">
                        This chapter does not include questions.
                      </p>
                    </div>
                  </Card>
                );
              }
              
              // Return regular practice card for chapters with questions
              return (
                <Card 
                  key={ch.id} 
                  className={`p-6 hover:shadow-lg transition-all duration-300`}
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
                          {hasQuestions ? `${ch.questionCount} questions` : 'Chapter overview'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    {hasQuestions ? (
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
                    ) : (
                      <div className="w-full py-3 px-6 bg-gray-100 text-gray-500 rounded-lg text-center">
                        <div className="flex items-center justify-center">
                          <span className="mr-2"></span> 
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                        This chapter does not include questions.
                        </p>
                      </div>
                    )}
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