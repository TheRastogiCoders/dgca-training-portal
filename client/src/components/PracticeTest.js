import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import debugLog from '../utils/debug';
import SEO from './SEO';

const PracticeTest = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const testTypes = [
    {
      id: 'ai',
      title: "PYQ Questions",
      icon: "📝",
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
  const fetchResults = async () => {
    if (!isAuthenticated) {
      debugLog('User not authenticated, skipping results fetch');
      return;
    }
    debugLog('Fetching results for user...');
    setLoadingResults(true);
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
        setLoadingResults(false);
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
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [isAuthenticated]);

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
  }, [isAuthenticated]);

  // Also refresh when component mounts (in case user navigated back)
  useEffect(() => {
    if (isAuthenticated) {
      debugLog('Component mounted, fetching results...');
      fetchResults();
    }
  }, []);

  // Listen for custom refresh event from AI practice results
  useEffect(() => {
    const handleRefreshEvent = () => {
      debugLog('Received refresh event from AI practice results');
      fetchResults();
    };

    window.addEventListener('refreshPracticeResults', handleRefreshEvent);
    return () => window.removeEventListener('refreshPracticeResults', handleRefreshEvent);
  }, []);

  const recentTests = useMemo(() => {
    if (!Array.isArray(results)) return [];
    const mapped = results.map(r => ({
      subject: r.subject?.name || r.subjectName || 'Unknown',
      score: Math.round((Number(r.score || 0) / Math.max(1, Number(r.total || 0))) * 100),
      date: r.createdAt ? new Date(r.createdAt) : new Date(),
      questions: r.total || (r.answers?.length || 0),
      testType: r.testType || 'book',
      timeSpent: r.timeSpent || 0,
      chapterName: r.chapterName,
    }));
    mapped.sort((a, b) => b.date - a.date);
    return mapped.slice(0, 5).map(m => ({
      subject: m.subject,
      score: m.score,
      date: m.date.toISOString().slice(0, 10),
      questions: m.questions,
      testType: m.testType,
      timeSpent: m.timeSpent,
      chapterName: m.chapterName,
    }));
  }, [results]);

  const stats = useMemo(() => {
    if (!Array.isArray(results) || results.length === 0) {
      return { 
        tests: 0, 
        avg: 0, 
        best: 0, 
        streakDays: 0, 
        bySubject: [],
        byTestType: [],
        totalTime: 0,
        improvement: 0
      };
    }
    const percents = results.map(r => (Number(r.score || 0) / Math.max(1, Number(r.total || 0))) * 100);
    const tests = results.length;
    const avg = Math.round(percents.reduce((a, b) => a + b, 0) / tests);
    const best = Math.round(Math.max(...percents));
    
    // Calculate streak
    const days = new Set(results.map(r => (r.createdAt ? new Date(r.createdAt) : new Date()).toDateString()));
    let streak = 0; 
    let cursor = new Date();
    for (;;) { 
      if (days.has(cursor.toDateString())) { 
        streak += 1; 
      } else { 
        break; 
      } 
      cursor.setDate(cursor.getDate() - 1); 
    }
    
    // Subject performance
    const bySub = {};
    results.forEach(r => {
      const key = r.subject?.name || r.subjectName || 'Unknown';
      const pct = (Number(r.score || 0) / Math.max(1, Number(r.total || 0))) * 100;
      if (!bySub[key]) bySub[key] = [];
      bySub[key].push(pct);
    });
    const bySubject = Object.entries(bySub).map(([name, arr]) => ({ 
      name, 
      value: Math.round(arr.reduce((a,b)=>a+b,0)/arr.length),
      count: arr.length
    }));

    // Test type performance
    const byType = {};
    results.forEach(r => {
      const key = r.testType || 'book';
      const pct = (Number(r.score || 0) / Math.max(1, Number(r.total || 0))) * 100;
      if (!byType[key]) byType[key] = [];
      byType[key].push(pct);
    });
    const byTestType = Object.entries(byType).map(([name, arr]) => ({ 
      name: name === 'ai' ? 'AI Practice' : name === 'admin' ? 'Admin Analysis' : 'Book Questions', 
      value: Math.round(arr.reduce((a,b)=>a+b,0)/arr.length),
      count: arr.length
    }));

    // Total time spent
    const totalTime = results.reduce((sum, r) => sum + (r.timeSpent || 0), 0);

    // Improvement calculation (last 5 vs first 5)
    const sortedResults = [...results].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstFive = sortedResults.slice(0, 5);
    const lastFive = sortedResults.slice(-5);
    const firstAvg = firstFive.length > 0 ? firstFive.reduce((sum, r) => sum + (Number(r.score || 0) / Math.max(1, Number(r.total || 0))) * 100, 0) / firstFive.length : 0;
    const lastAvg = lastFive.length > 0 ? lastFive.reduce((sum, r) => sum + (Number(r.score || 0) / Math.max(1, Number(r.total || 0))) * 100, 0) / lastFive.length : 0;
    const improvement = Math.round(lastAvg - firstAvg);

    return { 
      tests, 
      avg, 
      best, 
      streakDays: streak, 
      bySubject,
      byTestType,
      totalTime,
      improvement
    };
  }, [results]);

  const handleTestClick = (test) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (typeof test.onClick === 'function') {
      test.onClick();
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <>
      <SEO
        title="DGCA PYQ Practice Tests | Previous Year Questions - VIMAANNA"
        description="Practice DGCA previous year questions (PYQ) with our comprehensive test series. Access PYQ sessions for Air Regulations, Meteorology, Air Navigation, and Technical General. Free DGCA mock tests and practice exams."
        keywords="DGCA PYQ, DGCA previous year questions, DGCA practice test, DGCA mock test, DGCA exam questions, DGCA sample papers, DGCA test series, DGCA online practice, DGCA exam preparation"
      />
      <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 sm:pt-24 md:pt-24 pb-20 sm:pb-24 md:pb-8 md:ml-56 lg:ml-64 xl:ml-72">
          <div className="max-w-6xl mx-auto w-full">
            {/* Hero */}
            <div className="text-center mb-6 sm:mb-8 md:mb-12 animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-3 sm:mb-4 px-2">
                PYQ Practice
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 px-2">
                <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Master DGCA exams with curated Previous Year Questions, adaptive sessions, and clear progress insights.
                </p>
                {!isAuthenticated && (
                  <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm whitespace-nowrap">
                    <span className="text-yellow-700 font-medium text-xs sm:text-sm">🔒 Login required to access PYQ practice</span>
                  </div>
                )}
              </div>

            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-14">
              {/* Left: Primary PYQ card */}
              <div className="w-full">
                {testTypes.map((test) => (
                  <Card
                    key={test.id}
                    className="p-5 sm:p-6 md:p-8 cursor-pointer hover:shadow-xl transition-all duration-300 group bg-white border border-gray-200 rounded-xl animate-fade-in-up"
                    onClick={() => handleTestClick(test)}
                  >
                    <div className="flex flex-col text-center md:text-left">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r ${test.color} rounded-xl flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl mx-auto md:mx-0 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        {test.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-2 group-hover:text-blue-600 transition-colors">
                          {test.title}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">{test.description}</p>
                        <button className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r ${test.color} text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}>
                          Start PYQ Practice
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Right: Highlights / How it works */}
              <div className="space-y-4 sm:space-y-6 w-full">
                <Card className="p-5 sm:p-6 md:p-8 bg-white border border-gray-200 rounded-xl">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Why practice PYQs?</h3>
                  <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">✓</span>
                      <span className="flex-1">Practice with authentic DGCA Previous Year Questions</span>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">✓</span>
                      <span className="flex-1">Keep your weak areas in focus with adaptive difficulty</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">✓</span>
                      <span className="flex-1">Real-time feedback and performance insights</span>
                    </li>
                  </ul>
                </Card>
                <Card className="p-5 sm:p-6 md:p-8 bg-white border border-gray-200 rounded-xl">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">How it works</h3>
                  <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base text-gray-700 list-decimal list-inside">
                    <li className="pl-1 sm:pl-2 leading-relaxed">Click "Start PYQ Practice" and select your subject or book</li>
                    <li className="pl-1 sm:pl-2 leading-relaxed">Choose your chapter and start practicing</li>
                    <li className="pl-1 sm:pl-2 leading-relaxed">Login to view your progress and performance insights on your profile</li>
                  </ol>
                </Card>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
    </>
  );
};
export default PracticeTest;
