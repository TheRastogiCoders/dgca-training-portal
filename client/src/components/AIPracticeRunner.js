import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import Modal from './ui/Modal';

const friendly = (slug) => (slug || '')
  .split('-')
  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
  .join(' ');

// Remove hardcoded AI sample questions — return null to indicate no generator
const generateQuestion = () => null;

const AIPracticeRunner = () => {
  const { subjectSlug, bookSlug, chapterSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportComment, setReportComment] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  
  const timerRef = useRef(null);
  const questionStartTime = useRef(null);

  // Get data from location state
  const practiceSettings = location.state?.practiceSettings || {
    questionCount: 10,
    difficulty: 'adaptive',
    timeLimit: 'unlimited',
    showExplanations: true
  };
  const chapter = location.state?.chapter;
  const subject = location.state?.subject;
  const book = location.state?.book;

  const subjectName = subject?.name || friendly(subjectSlug);
  const bookName = book?.name || friendly(bookSlug);
  const chapterName = chapter?.name || friendly(chapterSlug);

  // Initialize practice session
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const initializePractice = () => {
      setLoading(true);
      setStartTime(Date.now());
      
      // Do not generate any sample questions
      setQuestions([]);
      setLoading(false);
    };

    initializePractice();
  }, [isAuthenticated, authLoading, navigate, practiceSettings.questionCount, subjectName, chapterName, practiceSettings.difficulty]);

  // Timer logic
  useEffect(() => {
    if (practiceSettings.timeLimit !== 'unlimited' && !done && !loading) {
      const timePerQuestion = parseInt(practiceSettings.timeLimit);
      setTimeLeft(timePerQuestion);
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [current, done, loading, practiceSettings.timeLimit]);

  const handleTimeUp = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Auto-submit current question if time runs out
    if (selectedAnswer === null) {
      setSelectedAnswer(-1); // Mark as unanswered
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    }
  };

  const selectAnswer = (idx) => {
    if (selectedAnswer !== null) return; // Prevent changing answer after selection
    
    setSelectedAnswer(idx);
    const isAnswerCorrect = idx === questions[current].answerIndex;
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(prevMax => Math.max(prevMax, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    
    setAnswers(prev => ({ ...prev, [current]: idx }));
    
    if (practiceSettings.showExplanations) {
      setShowExplanation(true);
    }
  };

  const saveResults = async () => {
    try {
      console.log('Saving AI practice results...', { score, total: practiceSettings.questionCount, subjectName, bookName, chapterName });
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const resultData = {
        testType: 'ai',
        subjectName: subjectName,
        bookName: bookName,
        chapterName: chapterName,
        score: score,
        total: practiceSettings.questionCount,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        difficulty: practiceSettings.difficulty,
        answers: questions.map((question, index) => ({
          questionText: question.text,
          selected: question.options[answers[index]] || '',
          correct: answers[index] === question.answerIndex,
          explanation: question.explanation
        }))
      };

      console.log('Result data to save:', resultData);

      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resultData)
      });

      console.log('Save response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save results:', errorText);
      } else {
        const savedResult = await response.json();
        console.log('Results saved successfully:', savedResult);
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const nextQuestion = () => {
    if (current >= practiceSettings.questionCount - 1) {
      setDone(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Save results when test is completed
      saveResults();
      return;
    }
    
    setCurrent(prev => prev + 1);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setTimeLeft(practiceSettings.timeLimit !== 'unlimited' ? parseInt(practiceSettings.timeLimit) : null);
  };

  const restart = () => {
    setCurrent(0);
    setAnswers({});
    setDone(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setStartTime(Date.now());
    
    // Do not regenerate any sample questions
    setQuestions([]);
  };

  const handleReportClick = () => {
    setShowReportModal(true);
    setReportType('');
    setReportComment('');
    setReportSubmitted(false);
  };

  const handleReportClose = () => {
    setShowReportModal(false);
    setReportType('');
    setReportComment('');
    setReportSubmitted(false);
  };

  const handleReportSubmit = async () => {
    // Validation
    if (!reportType) {
      return;
    }
    if (reportType === 'Other' && !reportComment.trim()) {
      return;
    }

    setIsSubmittingReport(true);
    
    try {
      const currentQuestion = questions[current];
      if (!currentQuestion) {
        throw new Error('Question not found');
      }
      
      // Format the report details for Gmail compose
      const supportEmail = 'contactvimaanna@gmail.com';
      const subject = `Question Report: ${reportType}`;
      
      let body = `Report Type: ${reportType}\n\n`;
      body += `Question: ${current + 1} of ${practiceSettings.questionCount}\n`;
      body += `Subject: ${subjectName}\n`;
      if (bookName) {
        body += `Book: ${bookName}\n`;
      }
      if (chapterName) {
        body += `Chapter: ${chapterName}\n`;
      }
      body += `\nQuestion Text:\n${currentQuestion.text}\n\n`;
      
      if (reportComment.trim()) {
        body += `Additional Details:\n${reportComment.trim()}\n\n`;
      }
      
      body += `---\nReported from: ${window.location.href}`;
      
      // Open Gmail compose window
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
      
      // Show success message
      setReportSubmitted(true);
      setTimeout(() => {
        handleReportClose();
      }, 2000);
    } catch (error) {
      console.error('Error preparing report:', error);
      alert('Failed to prepare report. Please try again.');
      setIsSubmittingReport(false);
    }
  };

  const getScorePercentage = () => {
    return Math.round((score / practiceSettings.questionCount) * 100);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! Well done!';
    if (percentage >= 70) return 'Good work! Keep practicing!';
    if (percentage >= 60) return 'Not bad! Room for improvement.';
    return 'Keep studying! You can do better!';
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Preparing Your AI Practice</h2>
                <p className="text-gray-600">Generating personalized questions...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
                <p className="text-gray-600 mb-6">Please log in to access AI practice sessions.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </button>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (done) {
    const percentage = getScorePercentage();
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              {/* Results Header */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6">
                  🎉
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  Practice Complete!
                </h1>
                <p className="text-xl text-gray-600">
                  {subjectName} • {chapterName}
                </p>
              </div>

              {/* Score Overview */}
              <Card className="p-8 mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                <div className="text-center mb-8">
                  <div className={`text-6xl font-bold mb-4 ${getScoreColor(percentage)}`}>
                    {percentage}%
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{getScoreMessage(percentage)}</h2>
                  <p className="text-gray-600">
                    You scored {score} out of {practiceSettings.questionCount} questions correctly
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">{score}</div>
                    <div className="text-sm text-gray-500">Correct Answers</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-red-600">{practiceSettings.questionCount - score}</div>
                    <div className="text-sm text-gray-500">Incorrect Answers</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-purple-600">{maxStreak}</div>
                    <div className="text-sm text-gray-500">Best Streak</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">{minutes}:{seconds.toString().padStart(2, '0')}</div>
                    <div className="text-sm text-gray-500">Total Time</div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={restart}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </div>
                </button>
                <button
                  onClick={() => navigate(`/pyq/ai/${subjectSlug}`)}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Try Another Chapter
                  </div>
                </button>
                <button
                  onClick={() => {
                    // Trigger a custom event to refresh the practice test page
                    window.dispatchEvent(new CustomEvent('refreshPracticeResults'));
                    navigate('/pyq');
                  }}
                  className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    View Results Dashboard
                  </div>
                </button>
              </div>
            </div>
          </main>
            </div>
          </div>
    );
  }

  // If there are no questions, show a graceful empty state
  if (!loading && (!questions || questions.length === 0)) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Questions Coming Soon</h1>
                <p className="text-gray-600 mb-6">
                  AI-generated questions are not available right now for this chapter.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => navigate(`/pyq/ai/${subjectSlug}`)} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                    Choose Another Chapter
                  </button>
                  <button onClick={() => navigate('/pyq')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg">
                    Back to Practice
                  </button>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Current question interface
  const currentQuestion = questions[current];
  const progress = ((current + 1) / practiceSettings.questionCount) * 100;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        <SiteSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{subjectName}</h1>
                  <p className="text-gray-600">{chapterName} • {bookName}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Question {current + 1} of {practiceSettings.questionCount}</div>
                  <div className="text-lg font-bold text-blue-600">Score: {score}</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
            </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress: {Math.round(progress)}%</span>
                <span>Streak: {streak}</span>
                {timeLeft !== null && (
                  <span className={timeLeft <= 10 ? 'text-red-600 font-bold' : ''}>
                    Time: {timeLeft}s
                  </span>
                )}
                  </div>
                </div>

            {/* Question Card */}
            <Card className="p-0 mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mr-3">
                      Question {current + 1}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                  {timeLeft !== null && (
                    <div className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
                      {timeLeft}s
                    </div>
                  )}
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 leading-relaxed flex-1">
                  {currentQuestion.text}
                </h2>
                  <button
                    onClick={handleReportClick}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                    title="Report an issue with this question"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report
                  </button>
                </div>
              </div>
              
                <div className="p-6">
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    let buttonClass = "w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ";
                    
                    if (selectedAnswer !== null) {
                      if (idx === currentQuestion.answerIndex) {
                        buttonClass += "border-green-500 bg-green-50 text-green-800 font-medium";
                      } else if (idx === selectedAnswer && idx !== currentQuestion.answerIndex) {
                        buttonClass += "border-red-500 bg-red-50 text-red-800";
                      } else {
                        buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
                      }
                    } else {
                      buttonClass += "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                    }
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => selectAnswer(idx)}
                        disabled={selectedAnswer !== null}
                        className={buttonClass}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                            selectedAnswer !== null && idx === currentQuestion.answerIndex ? 'border-green-500 bg-green-500' :
                            selectedAnswer !== null && idx === selectedAnswer && idx !== currentQuestion.answerIndex ? 'border-red-500 bg-red-500' :
                            'border-gray-300'
                          }`}>
                            {selectedAnswer !== null && idx === currentQuestion.answerIndex && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {selectedAnswer !== null && idx === selectedAnswer && idx !== currentQuestion.answerIndex && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Explanation */}
                {showExplanation && currentQuestion.explanation && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                    <p className="text-blue-800 text-sm">{currentQuestion.explanation}</p>
                  </div>
                )}
                
                {/* Next Button */}
                {selectedAnswer !== null && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={nextQuestion}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      {current >= practiceSettings.questionCount - 1 ? 'Finish Practice' : 'Next Question'}
                      </button>
                  </div>
                )}
                </div>
              </Card>
          </div>
        </main>
      </div>

      {/* Report Modal */}
      <Modal
        open={showReportModal}
        onClose={handleReportClose}
        title="Report an Issue"
        footer={
          <>
            <button
              onClick={handleReportClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleReportSubmit}
              disabled={!reportType || (reportType === 'Other' && !reportComment.trim()) || isSubmittingReport || reportSubmitted}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                !reportType || (reportType === 'Other' && !reportComment.trim()) || isSubmittingReport || reportSubmitted
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {isSubmittingReport ? 'Submitting...' : reportSubmitted ? 'Submitted!' : 'Submit Report'}
            </button>
          </>
        }
      >
        <div className="py-4">
          {reportSubmitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">Opening Gmail...</p>
              <p className="text-sm text-gray-600 mt-2">Your report has been prepared. A Gmail compose window will open. Please send the email to submit your report.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6 text-sm">
                Help us improve by reporting any issues with this question. Please select the type of issue:
              </p>
              
              <div className="space-y-3 mb-6">
                {['Wrong Answer', 'Incorrect Question', 'Formatting Issue', 'Missing Data', 'Other'].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      reportType === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type}
                      checked={reportType === type}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 text-gray-900 font-medium">{type}</span>
                  </label>
                ))}
              </div>

              {reportType === 'Other' && (
                <div className="mb-4 transition-all duration-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please provide details:
                  </label>
                  <textarea
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    placeholder="Describe the issue..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  />
                  {reportType === 'Other' && !reportComment.trim() && (
                    <p className="mt-1 text-xs text-red-600">Please provide details when selecting "Other"</p>
                  )}
                </div>
              )}

              {!reportType && (
                <p className="text-xs text-red-600 mb-4">Please select an issue type</p>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AIPracticeRunner;


