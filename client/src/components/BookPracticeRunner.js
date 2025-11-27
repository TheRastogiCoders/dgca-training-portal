import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import Modal from './ui/Modal';
import { API_ENDPOINTS } from '../config/api';
import { resolveChapterSlug } from '../utils/chapterSlug';
import debugLog from '../utils/debug';

const friendly = (slug) => (slug || '')
  .split('-')
  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
  .join(' ');

const BookPracticeRunner = () => {
  const { bookSlug, chapterSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
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
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationCache, setExplanationCache] = useState({});
  const startTimeRef = useRef(Date.now());
  const [answersHistory, setAnswersHistory] = useState({});

  const bookName = useMemo(() => {
    // Show "Air Law" for Oxford book (used in Air Regulations)
    if (bookSlug === 'oxford') {
      return 'Air Law';
    }
    let name = friendly(bookSlug);
    // Remove "2014" from the book name
    name = name.replace(/\s*2014\s*/gi, ' ').trim();
    return name;
  }, [bookSlug]);
  const resolvedChapterSlug = useMemo(
    () => (chapterSlug ? resolveChapterSlug(bookSlug, chapterSlug) : ''),
    [bookSlug, chapterSlug]
  );

  const chapterName = useMemo(() => {
    if (!chapterSlug && !resolvedChapterSlug) return '';
    return friendly(chapterSlug || resolvedChapterSlug);
  }, [chapterSlug, resolvedChapterSlug]);

  const storageKey = useMemo(
    () => `bookPractice:${bookSlug}:${resolvedChapterSlug || 'all'}`,
    [bookSlug, resolvedChapterSlug]
  );

  // Clean up duplicate answer labels in explanations (e.g., "A a." -> "A" or "B • b." -> "B")
  const cleanExplanationLabels = (text) => {
    if (!text) return text;
    
    // Pattern 1: Remove "A a." or "B b." or "C c." or "D d." (space between uppercase and lowercase)
    text = text.replace(/\b([A-F])\s+([a-f])\.?\b/gi, (match, upper, lower) => {
      if (upper.toUpperCase() === lower.toUpperCase()) {
        return upper;
      }
      return match;
    });
    
    // Pattern 2: Remove "A • a." or "B • b." (bullet separator)
    text = text.replace(/\b([A-F])\s*[•·]\s*([a-f])\.?\b/gi, (match, upper, lower) => {
      if (upper.toUpperCase() === lower.toUpperCase()) {
        return upper;
      }
      return match;
    });
    
    // Pattern 3: Remove "A + a." or "A + a" (plus sign)
    text = text.replace(/\b([A-F])\s*\+\s*([a-f])\.?\b/gi, (match, upper, lower) => {
      if (upper.toUpperCase() === lower.toUpperCase()) {
        return upper;
      }
      return match;
    });
    
    // Pattern 4: Remove "a. A" or "b. B" (lowercase first, then uppercase)
    text = text.replace(/\b([a-f])\.?\s+([A-F])\b/gi, (match, lower, upper) => {
      if (upper.toUpperCase() === lower.toUpperCase()) {
        return upper;
      }
      return match;
    });
    
    // Pattern 5: Remove "Correct Answer: A • a." or "Answer: B b."
    text = text.replace(/([Cc]orrect\s+)?[Aa]nswer:\s*([A-F])\s*[•·\+\s]+\s*([a-f])\.?/gi, (match, correct, upper, lower) => {
      if (upper.toUpperCase() === lower.toUpperCase()) {
        return (correct ? 'Correct Answer: ' : 'Answer: ') + upper;
      }
      return match;
    });
    
    // Pattern 6: Remove "A a" or "B b" at the start of sentences or after colons
    text = text.replace(/(^|:\s*)([A-F])\s+([a-f])(\s|\.|$)/gi, (match, prefix, upper, lower, suffix) => {
      if (upper.toUpperCase() === lower.toUpperCase()) {
        return prefix + upper + (suffix === '.' ? '.' : suffix);
      }
      return match;
    });
    
    // Pattern 7: Remove "A. a." or "B. b." (both with periods)
    text = text.replace(/\b([A-F])\.\s*([a-f])\./gi, (match, upper, lower) => {
      if (upper.toUpperCase() === lower.toUpperCase()) {
        return upper + '.';
      }
      return match;
    });
    
    // Pattern 8: Remove "A, a." or "B, b." (comma separator)
    text = text.replace(/\b([A-F]),\s*([a-f])\.?\b/gi, (match, upper, lower) => {
      if (upper.toUpperCase() === lower.toUpperCase()) {
        return upper;
      }
      return match;
    });
    
    return text;
  };

  const restoreState = (items) => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || !Array.isArray(saved.questionIds)) return;
      const ids = items.map(q => q.id);
      if (ids.length !== saved.questionIds.length) {
        localStorage.removeItem(storageKey);
        return;
      }
      const sameOrder = ids.every((id, idx) => id === saved.questionIds[idx]);
      if (!sameOrder) {
        localStorage.removeItem(storageKey);
        return;
      }
      if (typeof saved.current === 'number') {
        setCurrent(Math.min(Math.max(saved.current, 0), Math.max(items.length - 1, 0)));
      }
      if (typeof saved.selected === 'number' || saved.selected === null) {
        setSelected(saved.selected);
      }
      if (saved.answersHistory && typeof saved.answersHistory === 'object') {
        setAnswersHistory(saved.answersHistory);
      } else {
        setAnswersHistory({});
      }
      if (typeof saved.done === 'boolean') {
        setDone(saved.done);
      }
      if (typeof saved.score === 'number') {
        setScore(saved.score);
      }
      if (typeof saved.startTime === 'number') {
        startTimeRef.current = saved.startTime;
      }
    } catch (err) {
      console.warn('Failed to restore practice state:', err);
      localStorage.removeItem(storageKey);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const query = resolvedChapterSlug ? `?chapter=${encodeURIComponent(resolvedChapterSlug)}` : '';
        const primaryUrl = `${API_ENDPOINTS.PRACTICE_QUESTIONS(bookSlug)}${query}`;
        const fallbackUrl = `/api/practice-questions/${bookSlug}${query}`;

        const attemptFetch = async (url, label) => {
          debugLog(`[Frontend] Loading questions (${label}) → ${url}`);
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to load questions (${res.status})`);
        }
          return res.json();
        };

        let data;
        try {
          data = await attemptFetch(primaryUrl, 'primary');
        } catch (primaryError) {
          const primaryMsg = primaryError.message || '';
          const sameEndpoint = primaryUrl === fallbackUrl;
          const shouldFallback = !sameEndpoint && primaryMsg.toLowerCase().includes('not found');
          if (process.env.NODE_ENV === 'development' && !sameEndpoint) {
            try {
              data = await attemptFetch(fallbackUrl, 'fallback');
            } catch (fallbackError) {
              throw fallbackError;
            }
          } else if (shouldFallback) {
            try {
              data = await attemptFetch(fallbackUrl, 'fallback-forced');
            } catch (fallbackError) {
              throw fallbackError;
            }
          } else {
            throw primaryError;
          }
        }

        const list = Array.isArray(data.questions) ? data.questions : [];
        debugLog(`[Frontend] Received questions count: ${list.length}`);
        const optionLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const normalized = list.map(q => {
          const stableId = q.id ?? q.question_number ?? q.questionNumber ?? q.question_text ?? q.question;
          const mappedOptions = (q.options || []).map(o => o.text || o);
          let correctLabel = q.answer ?? q.correctAnswer ?? q.correct_answer ?? '';
          if (!correctLabel && q.solution) {
            const matchIndex = mappedOptions.findIndex(
              opt => String(opt).trim().toLowerCase() === String(q.solution).trim().toLowerCase()
            );
            if (matchIndex >= 0) {
              correctLabel = optionLabels[matchIndex] || '';
            }
          }

          const rawExplanation = q.explanation || q.solution || '';
          const cleanedExplanation = cleanExplanationLabels(rawExplanation);

          return {
            id: stableId ? String(stableId) : crypto.randomUUID?.() || String(Math.random()),
            text: q.question || q.text || q.question_text,
            options: mappedOptions,
            correctLabel: correctLabel || '',
            explanation: cleanedExplanation,
            solution: q.solution || '',
          };
        });
        setQuestions(normalized);
        setAnswersHistory({});
        restoreState(normalized);
      } catch (e) {
        setError(e.message || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookSlug, resolvedChapterSlug, navigate]);

  useEffect(() => {
    if (loading || questions.length === 0) return;
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
  }, [questions, current, selected, done, score, loading, storageKey, answersHistory]);
    

  const fetchExplanation = async (questionId, questionText, options, correctAnswer, selectedAnswer, fallbackText = 'Explanation not available.') => {
    // Check cache first
    const cacheKey = `${questionId}-${selectedAnswer || 'none'}`;
    if (explanationCache[cacheKey]) {
      return cleanExplanationLabels(explanationCache[cacheKey]);
    }

    setLoadingExplanation(true);
    try {
      const explainUrl = API_ENDPOINTS.SEARCH_ASK.replace('/api/search/ask', '/api/search/explain-question');
      const response = await fetch(explainUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          options: options,
          correctAnswer: correctAnswer,
          selectedAnswer: selectedAnswer,
          bookName,
          chapterName: (chapterSlug || resolvedChapterSlug)
            ? friendly(chapterSlug || resolvedChapterSlug)
            : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch explanation');
      }

      const data = await response.json();
      let explanation = data.explanation || fallbackText;
      
      // Clean up duplicate answer labels
      explanation = cleanExplanationLabels(explanation);
      
      // Cache the cleaned explanation
      setExplanationCache(prev => ({
        ...prev,
        [cacheKey]: explanation
      }));
      
      return explanation;
    } catch (error) {
      console.error('Error fetching explanation:', error);
      return cleanExplanationLabels(fallbackText);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const submitAnswer = async (optionIndex) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    setAnswersHistory(prev => ({
      ...prev,
      [current]: optionIndex
    }));
    const currentQuestion = questions[current];
    const labels = ['a','b','c','d','e','f'];
    const chosenLabel = labels[optionIndex];
    const isCorrect = String(chosenLabel).toLowerCase() === String(currentQuestion.correctLabel).toLowerCase();
    if (isCorrect) setScore(prev => prev + 1);
    
    // If we need an explanation (no local copy or AI needed), fetch with graceful fallback
    if (!isCorrect || !currentQuestion.explanation) {
      const fallbackExplanation = (currentQuestion.explanation && currentQuestion.explanation.trim())
        ? currentQuestion.explanation
        : (currentQuestion.solution || 'Explanation not available.');
      const explanation = await fetchExplanation(
        currentQuestion.id,
        currentQuestion.text,
        currentQuestion.options,
        currentQuestion.correctLabel,
        !isCorrect ? chosenLabel : undefined,
        fallbackExplanation
      );
      
      // Update the question with the explanation
      setQuestions(prev => prev.map((q, idx) => 
        idx === current 
          ? { ...q, explanation: explanation || q.explanation || fallbackExplanation }
          : q
      ));
    }
  };

  const goToQuestion = useCallback((index) => {
    if (index < 0 || index >= questions.length) return;
    setCurrent(index);
    const savedSelection = Object.prototype.hasOwnProperty.call(answersHistory, index)
      ? answersHistory[index]
      : null;
    setSelected(savedSelection);
  }, [answersHistory, questions.length]);

  const next = () => {
    if (current >= questions.length - 1) {
      setDone(true);
      return;
    }
    goToQuestion(current + 1);
  };

  const previous = () => {
    if (current === 0) return;
    goToQuestion(current - 1);
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
    navigate('/question-bank');
  };

  const cancelClose = () => {
    setShowCloseConfirm(false);
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
      body += `Question ID: ${currentQuestion.id || `Question ${current + 1}`}\n`;
      body += `Book: ${bookName}\n`;
      const chapterLabel = chapterSlug || resolvedChapterSlug;
      if (chapterLabel) {
        body += `Chapter: ${friendly(chapterLabel)}\n`;
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

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex flex-col md:flex-row w-full">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-10 md:ml-56 lg:ml-64 xl:ml-72">
            <div className="max-w-4xl mx-auto text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Loading {bookName}
                {chapterName ? ` • ${chapterName}` : ''} Questions
              </h2>
              <p className="text-gray-600">
                Fetching chapter content{chapterName ? ` for ${chapterName}` : ''}…
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex flex-col md:flex-row w-full">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-10 md:ml-56 lg:ml-64 xl:ml-72">
            <div className="max-w-3xl mx-auto w-full">
              <Card className="p-6 md:p-8 rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to start practice</h2>
                <p className="text-red-600 mb-6">{error}</p>
                <button onClick={() => navigate('/question-bank')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Go to Question Bank</button>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // No questions available yet (neutral state)
  if (!loading && questions.length === 0) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex flex-col md:flex-row w-full">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-10 md:ml-56 lg:ml-64 xl:ml-72">
            <div className="max-w-3xl mx-auto w-full">
              <Card className="p-6 md:p-8 text-center rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No questions available yet</h2>
                <p className="text-gray-600 mb-6">We’re preparing questions for {bookName}{(chapterSlug || resolvedChapterSlug) ? ` • ${friendly(chapterSlug || resolvedChapterSlug)}` : ''}. Please check back soon.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => navigate('/question-bank')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Go to Question Bank</button>
                  <button onClick={() => navigate('/pyq')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Back to Practice</button>
                </div>
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
                <p className="text-gray-600 mb-6">{bookName} • {questions.length} questions</p>
                <div className="text-6xl font-extrabold text-blue-600 mb-4">{percent}%</div>
                <div className="text-gray-600 mb-8">Correct: {score} / {questions.length} • Time: {Math.floor(totalTimeSec/60)}m {totalTimeSec%60}s</div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={restart} className="px-6 py-3 bg-blue-600 text-white rounded-lg">Try Again</button>
                  <button onClick={() => navigate('/question-bank')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Back to Question Bank</button>
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{bookName}</h1>
                    {chapterName && (
                      <p className="text-sm text-gray-500">{chapterName}</p>
                    )}
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
                      const rawOption = correctIndex >= 0 ? q.options[correctIndex] : '';
                      let correctOption = '';
                      if (rawOption !== undefined && rawOption !== null) {
                        if (typeof rawOption === 'string') {
                          correctOption = rawOption;
                        } else if (typeof rawOption === 'object') {
                          correctOption = rawOption.text || rawOption.label || '';
                        } else {
                          correctOption = String(rawOption);
                        }
                      }
                      
                      // Clean the option text to remove duplicate labels (e.g., "c. QFE" or "C • c. QFE" -> "QFE")
                      if (correctOption) {
                        // Remove patterns like "C • c. " or "A • a. " (bullet with duplicate)
                        correctOption = correctOption.replace(/^[A-F]\s*[•·]\s*[a-f]\.\s*/i, '');
                        // Remove patterns like "c. c. " or "a. a. " (double labels)
                        correctOption = correctOption.replace(/^([a-f])\.\s*\1\.\s*/i, '');
                        // Remove patterns like "C c. " or "A a. " (uppercase + lowercase)
                        correctOption = correctOption.replace(/^([A-F])\s+\1\.\s*/i, '');
                        // Remove patterns like "a. ", "b. ", "c. ", "A. ", "B. ", "C. " at the start
                        correctOption = correctOption.replace(/^[A-Fa-f]\.\s*/i, '');
                        // Remove patterns like "a) ", "b) ", "c) " at the start
                        correctOption = correctOption.replace(/^[A-Fa-f]\)\s*/i, '');
                        // Remove patterns like "(a) ", "(b) ", "(c) " at the start
                        correctOption = correctOption.replace(/^\([A-Fa-f]\)\s*/i, '');
                        // Remove patterns like "a ", "b ", "c " at the start (just letter and space)
                        correctOption = correctOption.replace(/^[A-Fa-f]\s+/i, '');
                        // Trim any leading whitespace
                        correctOption = correctOption.trim();
                      }
                      
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

export default BookPracticeRunner;


