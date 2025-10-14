import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import { API_ENDPOINTS } from '../config/api';

const friendly = (slug) => (slug || '')
  .split('-')
  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
  .join(' ');

const BookPracticeRunner = () => {
  const { bookSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const startTimeRef = useRef(Date.now());

  const bookName = useMemo(() => friendly(bookSlug), [bookSlug]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const url = API_ENDPOINTS.PRACTICE_QUESTIONS(bookSlug);
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to load questions (${res.status})`);
        }
        const data = await res.json();
        if (!Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error('No questions found for this book');
        }
        // Normalize to runner format
        const normalized = data.questions.map(q => ({
          id: q.id || crypto.randomUUID?.() || String(Math.random()),
          text: q.question || q.text,
          options: (q.options || []).map(o => o.text || o),
          correctLabel: q.answer,
        }));
        setQuestions(normalized);
      } catch (e) {
        setError(e.message || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookSlug, isAuthenticated, navigate]);

  const submitAnswer = (optionIndex) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    const currentQuestion = questions[current];
    const labels = ['a','b','c','d','e','f'];
    const chosenLabel = labels[optionIndex];
    const isCorrect = String(chosenLabel).toLowerCase() === String(currentQuestion.correctLabel).toLowerCase();
    if (isCorrect) setScore(prev => prev + 1);
    setAnswers(prev => ({ ...prev, [current]: optionIndex }));
  };

  const next = () => {
    if (current >= questions.length - 1) {
      setDone(true);
      return;
    }
    setCurrent(prev => prev + 1);
    setSelected(null);
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers({});
    setDone(false);
    setScore(0);
    startTimeRef.current = Date.now();
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading {bookName} Questions</h2>
              <p className="text-gray-600">Please wait…</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-3xl mx-auto">
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to start practice</h2>
                <p className="text-red-600 mb-6">{error}</p>
                <button onClick={() => navigate('/question-bank')} className="px-6 py-3 bg-blue-600 text-white rounded-lg">Go to Question Bank</button>
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
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Complete</h1>
                <p className="text-gray-600 mb-6">{bookName} • {questions.length} questions</p>
                <div className="text-6xl font-extrabold text-blue-600 mb-4">{percent}%</div>
                <div className="text-gray-600 mb-8">Correct: {score} / {questions.length} • Time: {Math.floor(totalTimeSec/60)}m {totalTimeSec%60}s</div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={restart} className="px-6 py-3 bg-blue-600 text-white rounded-lg">Try Again</button>
                  <button onClick={() => navigate('/question-bank')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg">Back to Question Bank</button>
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
      <div className="flex">
        <SiteSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{bookName}</h1>
                <p className="text-gray-600">Question {current + 1} of {questions.length}</p>
              </div>
              <div className="w-48">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>

            <Card className="p-0">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">{q.text}</h2>
              </div>
              <div className="p-6 space-y-3">
                {q.options.map((opt, idx) => {
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
                        <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-300">{labels[idx]}</span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
                {selected !== null && (
                  <div className="pt-4 text-center">
                    <button onClick={next} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg">
                      {current >= questions.length - 1 ? 'Finish Practice' : 'Next Question'}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookPracticeRunner;


