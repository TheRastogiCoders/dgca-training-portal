import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import Modal from './ui/Modal';
import { samplePapersData } from '../data/samplePapers';

const SamplePaperViewer = () => {
  const { subjectSlug, bookSlug, paperSlug } = useParams();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportComment, setReportComment] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [questionToReport, setQuestionToReport] = useState(null);
  const [questionIndexToReport, setQuestionIndexToReport] = useState(null);
  const startTimeRef = useRef(Date.now());
  const [answersHistory, setAnswersHistory] = useState({});

  // Get the paper key from slug (e.g., "sample-paper-1" -> "Sample Paper 1")
  const paperKey = useMemo(() => {
    if (!paperSlug) return null;
    // Convert "sample-paper-1" to "Sample Paper 1"
    return paperSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [paperSlug]);

  // Get questions from sample paper data
  const questions = useMemo(() => {
    if (!paperKey || !samplePapersData[paperKey]) return [];
    
    const paperData = samplePapersData[paperKey];
    const rawQuestions = paperData.Questions || [];
    
    // Transform the data format to match BookPracticeRunner format
    return rawQuestions.map((q) => {
      const options = [];
      if (q.Options) {
        // Convert Options object to array
        Object.keys(q.Options).forEach(key => {
          options.push(q.Options[key]);
        });
      }
      
      return {
        id: q.ID || q.id || String(Math.random()),
        text: q.Question || q.question || '',
        options: options,
        correctLabel: q.Correct_Answer || q.correctAnswer || q.correct_answer || '',
        explanation: q.Explanation || q.explanation || '',
      };
    });
  }, [paperKey]);

  const storageKey = useMemo(
    () => `samplePaper:${paperKey || 'unknown'}`,
    [paperKey]
  );

  // Restore state from localStorage
  const restoreState = useCallback((qs) => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.questionIds && data.questionIds.length === qs.length) {
          setCurrent(data.current || 0);
          setSelected(data.selected !== null ? data.selected : null);
          setDone(data.done || false);
          setScore(data.score || 0);
          setAnswersHistory(data.answersHistory || {});
          if (data.startTime) {
            startTimeRef.current = data.startTime;
          }
        }
      }
    } catch (err) {
      console.warn('Failed to restore state:', err);
    }
  }, [storageKey]);

  // Save state to localStorage
  useEffect(() => {
    if (questions.length === 0) return;
    const payload = {
      questionIds: questions.map(q => q.id),
      current,
      selected,
      done,
      score,
      startTime: startTimeRef.current,
      answersHistory,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (err) {
      console.warn('Unable to persist practice state:', err);
    }
  }, [questions, current, selected, done, score, storageKey, answersHistory]);

  // Restore state on mount
  useEffect(() => {
    if (questions.length > 0) {
      restoreState(questions);
    }
  }, [questions, restoreState]);

  const submitAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const q = questions[current];
    const labels = ['a', 'b', 'c', 'd', 'e', 'f'];
    const chosen = labels[idx];
    const correct = String(q.correctLabel).toLowerCase();
    const isCorrect = chosen === correct;
    
    setAnswersHistory(prev => ({
      ...prev,
      [current]: { selected: idx, correct: isCorrect }
    }));
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(prev => prev + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  };

  const previous = () => {
    if (current > 0) {
      setCurrent(prev => prev - 1);
      const prevAnswer = answersHistory[current - 1];
      setSelected(prevAnswer ? prevAnswer.selected : null);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setDone(false);
    setScore(0);
    setAnswersHistory({});
    startTimeRef.current = Date.now();
    localStorage.removeItem(storageKey);
  };

  const handleCloseTest = () => {
    setShowCloseConfirm(true);
  };

  const confirmClose = () => {
    localStorage.removeItem(storageKey);
    navigate(`/sample-papers/${subjectSlug}/${bookSlug}`);
  };

  const cancelClose = () => {
    setShowCloseConfirm(false);
  };

  const handleReportClick = (question, questionIndex) => {
    setQuestionToReport(question);
    setQuestionIndexToReport(questionIndex);
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
    setQuestionToReport(null);
    setQuestionIndexToReport(null);
  };

  const handleReportSubmit = async () => {
    if (!reportType) return;
    if (reportType === 'Other' && !reportComment.trim()) return;

    setIsSubmittingReport(true);
    
    try {
      const questionToReportNow = questionToReport || questions[questionIndexToReport ?? current];
      if (!questionToReportNow) {
        throw new Error('Question not found');
      }
      
      const questionIndex = questionIndexToReport ?? current;
      const supportEmail = 'contactvimaanna@gmail.com';
      const subject = `Question Report: ${reportType}`;
      
      let body = `Report Type: ${reportType}\n\n`;
      body += `Question ID: ${questionToReportNow.id || `Question ${questionIndex + 1}`}\n`;
      body += `Sample Paper: ${paperKey}\n`;
      body += `\nQuestion Text:\n${questionToReportNow.text}\n\n`;
      
      if (reportComment.trim()) {
        body += `Additional Details:\n${reportComment.trim()}\n\n`;
      }
      
      body += `---\nReported from: ${window.location.href}`;
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
      
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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex flex-col md:flex-row w-full">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-10 md:ml-56 lg:ml-64 xl:ml-72">
            <div className="max-w-3xl mx-auto w-full">
              <Card className="p-6 md:p-8 text-center rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sample Paper Not Found</h2>
                <p className="text-gray-600 mb-6">The requested sample paper could not be found.</p>
                <button 
                  onClick={() => navigate(`/sample-papers/${subjectSlug}/${bookSlug}`)} 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Sample Papers
                </button>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (done) {
    const percent = Math.round((score / questions.length) * 100);
    const totalTimeSec = Math.round((Date.now() - startTimeRef.current) / 1000);
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex flex-col md:flex-row w-full">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-10 md:ml-56 lg:ml-64 xl:ml-72">
            <div className="max-w-4xl mx-auto w-full">
              <Card className="p-6 md:p-8 text-center rounded-3xl shadow-xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Complete</h1>
                <p className="text-gray-600 mb-6">{paperKey} • {questions.length} questions</p>
                <div className="text-6xl font-extrabold text-blue-600 mb-4">{percent}%</div>
                <div className="text-gray-600 mb-8">Correct: {score} / {questions.length} • Time: {Math.floor(totalTimeSec/60)}m {totalTimeSec%60}s</div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={restart} className="px-6 py-3 bg-blue-600 text-white rounded-lg">Try Again</button>
                  <button 
                    onClick={() => navigate(`/sample-papers/${subjectSlug}/${bookSlug}`)} 
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back to Sample Papers
                  </button>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = Math.round(((current + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex flex-col md:flex-row w-full">
        <SiteSidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-10 md:ml-56 lg:ml-64 xl:ml-72">
          <div className="max-w-4xl mx-auto w-full space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{paperKey}</h1>
                <p className="text-gray-600 text-sm md:text-base">Question {current + 1} of {questions.length}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <div className="w-full sm:w-48">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
                <button
                  onClick={handleCloseTest}
                  className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-md"
                >
                  Close Test
                </button>
              </div>
            </div>

            <Card className="p-0 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-5 sm:p-6 border-b border-gray-100 bg-white/80">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-relaxed whitespace-pre-line flex-1">{q.text}</h2>
                  <button
                    onClick={() => handleReportClick(q, current)}
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
              <div className="p-5 sm:p-6 space-y-3">
                {q.options && q.options.length > 0 ? (
                  q.options.map((opt, idx) => {
                    const isSelected = selected === idx;
                    const labels = ['A','B','C','D','E','F'];
                    let cls = 'w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ';
                    if (selected !== null) {
                      const correct = String(q.correctLabel).toLowerCase();
                      const chosen = ['a','b','c','d','e','f'][idx];
                      if (chosen === correct) cls += 'border-green-500 bg-green-50 text-green-800 font-medium';
                      else if (isSelected) cls += 'border-red-500 bg-red-50 text-red-800';
                      else cls += 'border-gray-200 bg-gray-50 text-gray-600';
                    } else {
                      cls += 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer';
                    }
                    return (
                      <button key={idx} onClick={() => submitAnswer(idx)} disabled={selected !== null} className={cls}>
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-300 flex-shrink-0">{labels[idx]}</span>
                          <span className="text-sm sm:text-base">{opt}</span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> This is a non-MCQ question. You can proceed to the next question directly.
                    </p>
                  </div>
                )}
                
                {/* Correct Answer Summary */}
                {selected !== null && q.options && q.options.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    {(() => {
                      const labels = ['a', 'b', 'c', 'd', 'e', 'f'];
                      const correctIndex = labels.indexOf(String(q.correctLabel).toLowerCase());
                      const correctOption = correctIndex >= 0 ? q.options[correctIndex] : '';
                      const displayLabel = String(q.correctLabel || '').toUpperCase();
                      
                      return (
                        <p className="text-sm font-semibold text-gray-800">
                          Correct Answer: {displayLabel}{correctOption ? ` • ${correctOption}` : ''}
                        </p>
                      );
                    })()}
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={previous}
                    disabled={current === 0}
                    className={`w-full sm:w-auto px-8 py-3 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                      current === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Previous Question
                  </button>
                  <button 
                    onClick={next} 
                    disabled={selected === null && q.options && q.options.length > 0}
                    className={`w-full sm:w-auto px-8 py-3 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                      (selected === null && q.options && q.options.length > 0)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
                    }`}
                  >
                    {current >= questions.length - 1 ? 'Finish Practice' : 'Next Question'}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {/* Close Test Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Close Test?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to close the test? Your progress will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelClose}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                No, Continue
              </button>
              <button
                onClick={confirmClose}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Yes, Close Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <Modal
        open={showReportModal}
        onClose={handleReportClose}
        title="Report an Issue"
        footer={
          <>
            <button
              onClick={handleReportClose}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleReportSubmit}
              disabled={!reportType || (reportType === 'Other' && !reportComment.trim()) || isSubmittingReport || reportSubmitted}
              className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-2 text-sm sm:text-base rounded-lg font-medium transition-all duration-200 ${
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
        <div className="py-3 sm:py-4">
          {reportSubmitted ? (
            <div className="text-center py-4 sm:py-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">Opening Gmail...</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 px-2">Your report has been prepared. A Gmail compose window will open. Please send the email to submit your report.</p>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 px-1">
                Help us improve by reporting any issues with this question. Please select the type of issue:
              </p>
              
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {['Wrong Answer', 'Incorrect Question', 'Formatting Issue', 'Missing Data', 'Other'].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
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
                      className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                    />
                    <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-900 font-medium">{type}</span>
                  </label>
                ))}
              </div>

              {reportType === 'Other' && (
                <div className="mb-3 sm:mb-4 transition-all duration-300">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Please provide details:
                  </label>
                  <textarea
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    placeholder="Describe the issue..."
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  />
                  {reportType === 'Other' && !reportComment.trim() && (
                    <p className="mt-1 text-xs text-red-600">Please provide details when selecting "Other"</p>
                  )}
                </div>
              )}

              {!reportType && (
                <p className="text-xs text-red-600 mb-3 sm:mb-4">Please select an issue type</p>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SamplePaperViewer;

