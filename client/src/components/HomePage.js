import React, { useMemo, useState } from 'react';
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
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', content: string }
  const [sending, setSending] = useState(false);

  const normalize = (text) => (text || '').trim();

  const handleSend = async () => {
    const message = normalize(prompt);
    if (!message) return;
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setPrompt('');
    try {
      const res = await fetch(API_ENDPOINTS.AI_CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      const text = (data && (data.response || data.answer || '')) || '';
      const cleaned = text.replace(/^\s+/, '');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            cleaned ||
            'I’m here to help with DGCA prep. What topic would you like to study?'
        }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I could not reach the AI service. Meanwhile, tell me a DGCA topic (e.g., Air Regulations—Licensing), and I will guide you.'
        }
      ]);
    } finally {
      setSending(false);
    }
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

      {/* Chat area */}
      <div className="w-full max-w-5xl mt-4 md:mt-6 space-y-2 md:space-y-3 mx-auto px-4 md:px-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                  : 'bg-white/80 text-gray-900'
              } shadow rounded-2xl px-3 md:px-4 py-2 md:py-3 max-w-[85%] text-sm md:text-base break-words`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Search Interface */}
      <div className="mt-8 w-full px-4 md:px-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="flex items-center bg-white/30 backdrop-blur-md rounded-full border border-white/40 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Doubt?"
              className="flex-1 px-4 md:px-8 py-3 md:py-6 bg-transparent focus:outline-none text-gray-800 text-sm md:text-lg placeholder-gray-400 min-w-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
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
