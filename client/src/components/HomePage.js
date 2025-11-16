import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import { API_ENDPOINTS } from '../config/api';

const HomePage = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-24 md:pb-8 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            <MainHero />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;

const MainHero = () => {
  const { user } = useAuth();

  // Extract user's first name (from username or email)
  const firstName = useMemo(() => {
    const raw = user?.username || user?.email || '';
    if (!raw) return '';
    return raw.split(/[\s@._-]+/)[0];
  }, [user]);

  const [prompt, setPrompt] = useState('');
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const suggestionTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const normalize = (text) => (text || '').trim();

  // Fetch suggestions with debouncing (200ms)
  useEffect(() => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (prompt.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestionTimeoutRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`${API_ENDPOINTS.SEARCH_SUGGEST}?q=${encodeURIComponent(prompt)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 200);

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [prompt]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setPrompt(suggestion.text);
    setShowSuggestions(false);
    handleAsk(suggestion.id, suggestion.type);
  };

  const handleAsk = async (suggestionId = null, suggestionType = null) => {
    const query = normalize(prompt);
    if (!query) return;

    setSending(true);
    setAnswer(null);
    setShowSuggestions(false);
    
    try {
      console.log('Fetching answer from:', API_ENDPOINTS.SEARCH_ASK);
      console.log('Request body:', {
        query,
        suggestionId: suggestionId || selectedSuggestion?.id,
        suggestionType: suggestionType || selectedSuggestion?.type
      });
      
      const res = await fetch(API_ENDPOINTS.SEARCH_ASK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          suggestionId: suggestionId || selectedSuggestion?.id,
          suggestionType: suggestionType || selectedSuggestion?.type
        })
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Response error:', errorText);
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      console.log('Response data:', data);
      setAnswer(data);
    } catch (error) {
      console.error('Error fetching answer:', error);
      setAnswer({
        title: 'Error',
        simpleExplanation: `Failed to fetch answer: ${error.message}. Please make sure the server is running and try again.`,
        detailedExplanation: error.stack || '',
        examples: [],
        formulas: [],
        bookReferences: [],
        relatedPYQs: [],
        relatedSubtopics: []
      });
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    await handleAsk();
  };

  return (
    <div className="px-4 md:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-8rem)] pb-20 md:pb-8 w-full">
      <div className="max-w-3xl text-center w-full">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Hey,
          </span>{' '}
          <span className="text-gray-900">
            {firstName}
          </span>
        </h1>
      </div>


      {/* Answer Display */}
      {answer && (
        <div className="mt-6 w-full max-w-4xl mx-auto px-4 md:px-0">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{answer.title}</h2>
            
            {answer.simpleExplanation && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Quick Answer</h3>
                <p className="text-gray-700 leading-relaxed">{answer.simpleExplanation}</p>
              </div>
            )}

            {answer.detailedExplanation && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Detailed Explanation</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{answer.detailedExplanation}</div>
              </div>
            )}

            {answer.formulas && answer.formulas.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Formulas</h3>
                <div className="space-y-3">
                  {answer.formulas.map((formula, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="font-mono text-gray-800 mb-1">{formula.formula}</div>
                      {formula.description && (
                        <div className="text-sm text-gray-600">{formula.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {answer.examples && answer.examples.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Examples</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {answer.examples.map((example, idx) => (
                    <li key={idx}>{example}</li>
                  ))}
                </ul>
              </div>
            )}

            {answer.bookReferences && answer.bookReferences.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Book Reference</h3>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  {answer.bookReferences.map((ref, idx) => (
                    <div key={idx} className="text-gray-700">
                      <div className="font-semibold">{ref.bookName}</div>
                      {ref.author && <div className="text-sm text-gray-600">by {ref.author}</div>}
                      <div className="text-sm text-gray-600 mt-1">
                        {ref.chapterName} - Page {ref.pageNumber}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {answer.relatedPYQs && answer.relatedPYQs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Related PYQs</h3>
                <div className="space-y-4">
                  {answer.relatedPYQs.map((pyq, idx) => (
                    <div key={idx} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded">
                          {pyq.exam} {pyq.year}
                        </span>
                        {pyq.marks && (
                          <span className="text-xs text-gray-600">({pyq.marks} marks)</span>
                        )}
                      </div>
                      <div className="font-semibold text-gray-800 mb-1">{pyq.question}</div>
                      <div className="text-sm text-gray-700">{pyq.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {answer.relatedQuestions && answer.relatedQuestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Related Practice Questions</h3>
                <div className="space-y-3">
                  {answer.relatedQuestions.map((q, idx) => (
                    <div key={idx} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <div className="font-semibold text-gray-800 mb-2">{q.question}</div>
                      {q.options && q.options.length > 0 && (
                        <div className="text-sm text-gray-600 mb-2 space-y-1">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx}>{opt}</div>
                          ))}
                        </div>
                      )}
                      {q.answer && (
                        <div className="text-sm font-medium text-green-700 mt-2">
                          Answer: {q.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {answer.relatedSubtopics && answer.relatedSubtopics.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {answer.relatedSubtopics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm cursor-pointer hover:bg-purple-200 transition-colors"
                      onClick={() => {
                        setPrompt(topic.title);
                        handleAsk(topic.id, 'topic');
                      }}
                    >
                      {topic.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Interface */}
      <div className="mt-8 w-full px-4 md:px-0">
        <form
          onSubmit={handleSend}
          className="relative max-w-4xl mx-auto"
        >
          <div className="relative">
            <div className="flex items-center bg-white/30 backdrop-blur-md rounded-full border border-white/40 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <input
                ref={searchInputRef}
                type="text"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setSelectedSuggestion(null);
                  setAnswer(null);
                }}
                placeholder="Ask Doubt?"
                className="flex-1 px-4 md:px-8 py-3 md:py-6 bg-transparent focus:outline-none text-gray-800 text-sm md:text-lg placeholder-gray-400 min-w-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
                    e.preventDefault();
                    // Focus first suggestion
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
              />
              <div className="px-2 md:px-6 flex-shrink-0">
                <button
                  type="submit"
                  disabled={sending || !prompt.trim()}
                  className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  aria-label="Send"
                >
                  {sending ? (
                    <div className="w-3 h-3 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-4 h-4 md:w-6 md:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-80 overflow-y-auto"
              >
                {loadingSuggestions && (
                  <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
                )}
                {!loadingSuggestions && suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-gray-800 text-sm md:text-base">{suggestion.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Contact Support Link */}
        <div className="mt-4 flex justify-center">
          <Link 
            to="/support/contact" 
            className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-2 group"
          >
            <svg 
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};
