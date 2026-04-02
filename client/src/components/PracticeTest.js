import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import debugLog from '../utils/debug';
import SEO from './SEO';
import { IconClipboard } from './ui/Icons';

const PracticeTest = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  const testTypes = [
    {
      id: 'ai',
      title: "PYQ Questions",
      Icon: IconClipboard,
      description: "Previous Year Questions for comprehensive exam preparation",
      color: "from-purple-500 to-indigo-600",
      features: [
        "Adaptive difficulty",
        "Personalized learning",
        "Real-time feedback",
        "Performance insights"
      ],
      onClick: () => navigate('/pyq/ai')
    }
  ];

  // Load real results for the logged-in user
  const fetchResults = useCallback(async () => {
    if (!isAuthenticated) {
      debugLog('User not authenticated, skipping results fetch');
      return;
    }
    debugLog('Fetching results for user...');
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        setResults([]);
        return;
      }
      
      // Test basic API connection first
      try {
        const testRes = await fetch('/api/results/test');
        if (testRes.ok) {
          const testData = await testRes.json();
          debugLog('API test response:', testData);
        } else {
          debugLog('API test failed:', testRes.status);
        }
      } catch (e) {
        debugLog('API test error:', e.message);
        debugLog('Server might not be running. Please start the server with: cd server && npm start');
        return;
      }
      
      debugLog('Fetching results with token (masked) for authenticated user');
      const res = await fetch('/api/results', { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });
      debugLog('Results fetch response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error Response:', errorText);
        if (res.status === 401) {
          console.error('Authentication failed - token may be invalid');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setResults([]);
          return;
        }
        if (res.status === 404) {
          throw new Error('Server not running. Please start the server with: cd server && npm start');
        }
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      debugLog('Fetched results data:', data);
      debugLog('Results count:', Array.isArray(data) ? data.length : 'Not an array');
      
      if (Array.isArray(data)) {
        setResults(data);
        debugLog('Successfully set results:', data.length, 'items');
      } else {
        console.error('Invalid data format received:', data);
        setResults([]);
      }
    } catch (e) {
      console.error('Error fetching results:', e);
      setResults([]);
    } finally {
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Refresh results when component becomes visible (user returns from test)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        debugLog('Page became visible, refreshing results...');
        fetchResults();
      }
    };

    const handleFocus = () => {
      if (isAuthenticated) {
        debugLog('Window focused, refreshing results...');
        fetchResults();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, fetchResults]);

  // Listen for custom refresh event from AI practice results
  useEffect(() => {
    const handleRefreshEvent = () => {
      debugLog('Received refresh event from AI practice results');
      fetchResults();
    };

    window.addEventListener('refreshPracticeResults', handleRefreshEvent);
    return () => window.removeEventListener('refreshPracticeResults', handleRefreshEvent);
  }, [fetchResults]);

  const handleTestClick = (test) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (typeof test.onClick === 'function') {
      test.onClick();
    }
  };

  return (
    <>
      <SEO
        title="DGCA PYQ Practice Tests | Previous Year Questions - VIMAANNA"
        description="Practice DGCA previous year questions (PYQ) with our comprehensive test series. Access PYQ sessions for Air Regulations, Meteorology, Air Navigation, and Technical General. DGCA mock tests and practice exams."
        keywords="DGCA PYQ, DGCA previous year questions, DGCA practice test, DGCA mock test, DGCA exam questions, DGCA sample papers, DGCA test series, DGCA online practice, DGCA exam preparation"
      />
      <div className="min-h-screen gradient-bg">
      <main className="page-content">
        <div className="page-content-inner max-w-6xl mx-auto w-full">
            {/* Hero */}
            <section className="text-center mb-8 sm:mb-10 md:mb-14">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 mb-3">Previous Year Questions</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 px-2">
                PYQ Practice
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium mb-4">
                Master DGCA exams with curated Previous Year Questions, subject-wise practice, and clear progress insights.
              </p>
              <p className="text-sm text-slate-500 mb-4">Wings within reach.</p>
              {isAuthenticated && Array.isArray(results) && (
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                  <span className="text-blue-700 font-medium text-xs sm:text-sm">
                    {results.length} practice result{results.length === 1 ? '' : 's'} saved
                  </span>
                </div>
              )}
              {!isAuthenticated && (
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                  <span className="text-amber-800 font-medium text-xs sm:text-sm">🔒 Login to access PYQ practice & track progress</span>
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-14">
              <div className="w-full">
                {testTypes.map((test) => (
                  <div
                    key={test.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleTestClick(test)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTestClick(test)}
                    className="site-card p-6 md:p-8 cursor-pointer hover:shadow-xl transition-all duration-300 group rounded-2xl">
                    <div className="flex flex-col text-center md:text-left">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r ${test.color} rounded-xl flex items-center justify-center text-white mx-auto md:mx-0 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        {test.Icon && <test.Icon className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" size="lg" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2 sm:mb-2 group-hover:text-blue-600 transition-colors">
                          {test.title}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">{test.description}</p>
                        <button type="button" className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r ${test.color} text-white font-semibold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}>
                          Start PYQ Practice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 sm:space-y-6 w-full">
                <div className="site-card p-6 md:p-8 rounded-2xl">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4">Why practice PYQs?</h3>
                  <ul className="space-y-3 text-sm md:text-base text-slate-700">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">✓</span>
                      <span>Practice with authentic DGCA Previous Year Questions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">✓</span>
                      <span>Focus on weak areas with subject and chapter-wise practice</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">✓</span>
                      <span>Real-time feedback and performance insights when you’re logged in</span>
                    </li>
                  </ul>
                </div>
                <div className="site-card p-6 md:p-8 rounded-2xl">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4">How it works</h3>
                  <ol className="space-y-3 text-sm md:text-base text-slate-700 list-decimal list-inside">
                    <li className="pl-1 leading-relaxed">Click &quot;Start PYQ Practice&quot; and select your subject or book</li>
                    <li className="pl-1 leading-relaxed">Choose your chapter and start practicing</li>
                    <li className="pl-1 leading-relaxed">Log in to view your progress and performance on your profile</li>
                  </ol>
                </div>
              </div>
            </div>

        </div>
      </main>
    </div>
    </>
  );
};
export default PracticeTest;
