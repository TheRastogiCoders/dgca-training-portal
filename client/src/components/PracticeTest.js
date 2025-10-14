import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';

const PracticeTest = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState(null);

  const testTypes = [
    {
      id: 'books',
      title: "Book Questions",
      icon: "📚",
      description: "Practice from IC Joshi, Oxford Aviation & more",
      color: "from-green-500 to-emerald-600",
      features: [
        "Chapter-wise practice",
        "Subject-specific tests",
        "Difficulty levels",
        "Detailed explanations"
      ],
      stats: { questions: "5,580+", books: "12+", subjects: "6" },
      onClick: () => navigate('/question-bank')
    },
    {
      id: 'admin',
      title: "Admin Analysis Questions",
      icon: "🛡️",
      description: "Expert-curated questions with detailed analysis",
      color: "from-blue-500 to-blue-700",
      features: [
        "Expert-reviewed content",
        "Performance analytics",
        "Weakness identification",
        "Progress tracking"
      ],
      stats: { questions: "2,500+", accuracy: "99%", experts: "15+" },
      onClick: () => navigate('/admin-analysis-questions')
    },
    {
      id: 'ai',
      title: "AI Generated Questions",
      icon: "🤖",
      description: "Smart adaptive practice powered by VIMAANNA AI",
      color: "from-purple-500 to-indigo-600",
      features: [
        "Adaptive difficulty",
        "Personalized learning",
        "Real-time feedback",
        "Performance insights"
      ],
      // Simpler, more neutral labels for a less "high level" feel
      stats: { questions: "Varies", ai: "AI", adaptive: "On" },
      onClick: () => navigate('/practice-test/ai')
    }
  ];

  // Load real results for the logged-in user
  const fetchResults = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping results fetch');
      return;
    }
    console.log('Fetching results for user...');
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
          console.log('API test response:', testData);
        } else {
          console.log('API test failed:', testRes.status);
        }
      } catch (e) {
        console.log('API test error:', e.message);
        console.log('Server might not be running. Please start the server with: cd server && npm start');
        setLoadingResults(false);
        return;
      }
      
      console.log('Fetching results with token:', token.substring(0, 20) + '...');
      const res = await fetch('/api/results', { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });
      console.log('Results fetch response status:', res.status);
      
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
      console.log('Fetched results data:', data);
      console.log('Results count:', Array.isArray(data) ? data.length : 'Not an array');
      
      if (Array.isArray(data)) {
        setResults(data);
        console.log('Successfully set results:', data.length, 'items');
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
        console.log('Page became visible, refreshing results...');
        fetchResults();
      }
    };

    const handleFocus = () => {
      if (isAuthenticated) {
        console.log('Window focused, refreshing results...');
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
      console.log('Component mounted, fetching results...');
      fetchResults();
    }
  }, []);

  // Listen for custom refresh event from AI practice results
  useEffect(() => {
    const handleRefreshEvent = () => {
      console.log('Received refresh event from AI practice results');
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
      return;
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
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 pb-20 md:pb-8 md:ml-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 md:mb-4">
                  Practice Tests
                </h1>
                <p className="text-base md:text-xl text-gray-600 mb-4 md:mb-6">
                  Choose your practice mode and track your progress
                </p>
                

              {!isAuthenticated && (
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-full mb-4">
                  <span className="text-yellow-800 font-medium text-sm">🔒 Login required to access practice tests</span>
                </div>
              )}
            </div>

            {/* Practice Test Types */}
            <div className="mb-8 md:mb-12">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
                Choose Your Practice Mode
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {testTypes.map((test) => (
                  <Card 
                    key={test.id} 
                    className="p-6 md:p-8 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                    onClick={() => handleTestClick(test)}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r ${test.color} rounded-2xl flex items-center justify-center text-white text-3xl md:text-4xl mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        {test.icon}
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors">
                        {test.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed">
                        {test.description}
                      </p>
                      
                      {/* Features */}
                      <div className="mb-4 md:mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Key Features:</h4>
                        <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600">
                          {test.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <svg className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-1 md:mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                        {Object.entries(test.stats).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-sm md:text-lg font-bold text-blue-600">{value}</div>
                            <div className="text-xs text-gray-500 capitalize">{key}</div>
                          </div>
                        ))}
                      </div>
                      
                      <button className={`w-full py-2 md:py-3 px-4 md:px-6 bg-gradient-to-r ${test.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm md:text-base`}>
                        Start Practice
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Results Section - Only show if authenticated */}
            {isAuthenticated && (
              <div className="space-y-6 md:space-y-8">
                {/* Quick Stats Overview */}
                <Card className="p-4 md:p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                  <div className="text-center mb-6 md:mb-8">
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">Your Performance Overview</h3>
                    <p className="text-sm md:text-base text-gray-600">Track your progress and improvement</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1 md:mb-2">{stats.tests}</div>
                      <div className="text-xs md:text-sm text-gray-600">Tests Taken</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1 md:mb-2">{stats.avg}%</div>
                      <div className="text-xs md:text-sm text-gray-600">Average Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{stats.best}%</div>
                      <div className="text-gray-600">Best Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">{stats.streakDays}</div>
                      <div className="text-gray-600">Day Streak</div>
                    </div>
                  </div>
                  
                  {stats.improvement !== 0 && (
                    <div className="mt-6 text-center">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full ${stats.improvement > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <svg className={`w-5 h-5 mr-2 ${stats.improvement > 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.improvement > 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                        </svg>
                        {stats.improvement > 0 ? '+' : ''}{stats.improvement}% Improvement
                      </div>
                    </div>
                  )}
                </Card>

                {/* Detailed Analytics */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Recent Tests */}
                  <Card className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Recent Tests</h3>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={fetchResults}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refresh
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              if (!token) {
                                alert('Please login first to create test data');
                                return;
                              }
                              
                              // Create multiple test results for better demo
                              const testResults = [
                                {
                                  testType: 'ai',
                                  subjectName: 'Air Regulations',
                                  bookName: 'IC Joshi',
                                  chapterName: 'Licensing',
                                  score: 8,
                                  total: 10,
                                  timeSpent: 300,
                                  difficulty: 'medium',
                                  answers: [
                                    { questionText: 'What is the minimum age for PPL?', selected: 'A', correct: true, explanation: 'Minimum age is 17 years' },
                                    { questionText: 'VFR visibility requirements?', selected: 'B', correct: false, explanation: 'VFR requires 3 miles visibility' }
                                  ]
                                },
                                {
                                  testType: 'ai',
                                  subjectName: 'Navigation',
                                  bookName: 'Oxford',
                                  chapterName: 'VOR/DME',
                                  score: 7,
                                  total: 10,
                                  timeSpent: 450,
                                  difficulty: 'hard',
                                  answers: [
                                    { questionText: 'VOR frequency range?', selected: 'C', correct: true, explanation: 'VOR operates in 108-118 MHz' },
                                    { questionText: 'DME accuracy?', selected: 'A', correct: false, explanation: 'DME accuracy is ±0.25 nm' }
                                  ]
                                },
                                {
                                  testType: 'book',
                                  subjectName: 'Meteorology',
                                  bookName: 'IC Joshi',
                                  chapterName: 'Weather Systems',
                                  score: 9,
                                  total: 10,
                                  timeSpent: 200,
                                  difficulty: 'easy',
                                  answers: [
                                    { questionText: 'What causes thunderstorms?', selected: 'B', correct: true, explanation: 'Convective activity causes thunderstorms' },
                                    { questionText: 'Cold front characteristics?', selected: 'A', correct: true, explanation: 'Cold fronts have steep slopes' }
                                  ]
                                }
                              ];
                              
                              console.log('Creating test results...');
                              for (const testResult of testResults) {
                                const res = await fetch('/api/results', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                  body: JSON.stringify(testResult)
                                });
                                if (res.ok) {
                                  console.log('Test result saved:', await res.json());
                                } else {
                                  console.error('Failed to save test result:', await res.text());
                                }
                              }
                              
                              // Refresh results after creating test data
                              setTimeout(() => {
                                fetchResults();
                              }, 1000);
                              
                              alert('Test data created successfully! Check the dashboard now.');
                            } catch (e) {
                              console.error('Error saving test result:', e);
                              alert('Error creating test data: ' + e.message);
                            }
                          }}
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          Create Test Data
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          View All
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {loadingResults ? (
                        <div className="text-center text-gray-600 py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          Loading your results...
                        </div>
                      ) : recentTests.length === 0 ? (
                        <div className="text-center text-gray-600 py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-lg font-medium mb-2">No tests taken yet</p>
                          <p className="text-sm">Start your first practice test to see results here!</p>
                        </div>
                      ) : (
                        recentTests.map((test, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="flex items-center mb-1">
                                  <h4 className="font-semibold text-gray-900">{test.subject}</h4>
                                  {test.testType === 'ai' && (
                                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                      AI Practice
                                    </span>
                                  )}
                                  {test.testType === 'admin' && (
                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                      Admin Analysis
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {test.testType === 'ai' ? 'AI Generated' : test.testType} • {test.questions} questions • {test.date}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${getScoreColor(test.score).split(' ')[0]}`}>
                                  {test.score}%
                                </div>
                                <div className="text-sm text-gray-500">
                                  {test.timeSpent ? formatTime(test.timeSpent) : 'N/A'}
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${test.score >= 80 ? 'bg-green-500' : test.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                style={{ width: `${test.score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  {/* Subject Performance */}
                  <Card className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Subject Performance</h3>
                    
                    <div className="space-y-4">
                      {stats.bySubject.length === 0 ? (
                        <div className="text-center text-gray-600 py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <p className="text-lg font-medium mb-2">No performance data yet</p>
                          <p className="text-sm">Take tests to see your subject-wise performance</p>
                        </div>
                      ) : (
                        stats.bySubject.map((subject) => (
                          <div key={subject.name} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">{subject.value}%</div>
                                <div className="text-sm text-gray-500">{subject.count} tests</div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full ${subject.value >= 80 ? 'bg-green-500' : subject.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                style={{ width: `${subject.value}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                {/* Test Type Performance */}
                {stats.byTestType.length > 0 && (
                  <Card className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Performance by Test Type</h3>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      {stats.byTestType.map((type) => (
                        <div key={type.name} className="p-6 bg-gray-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-2">{type.value}%</div>
                          <div className="font-semibold text-gray-900 mb-1">{type.name}</div>
                          <div className="text-sm text-gray-600">{type.count} tests</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div 
                              className={`h-2 rounded-full ${type.value >= 80 ? 'bg-green-500' : type.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                              style={{ width: `${type.value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PracticeTest;
