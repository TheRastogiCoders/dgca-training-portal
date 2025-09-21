import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import Button from './ui/Button';
import { API_ENDPOINTS } from '../config/api';

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 pb-20 md:pb-8">
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
  const firstName = useMemo(() => {
    const raw = user?.username || user?.email || '';
    if (!raw) return '';
    return raw.split(/[\s@._-]+/)[0];
  }, [user]);

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', content: string }
  const [sending, setSending] = useState(false);
  const suggestions = [
    { icon: '✈️', title: 'DGCA Air Regulations & Licensing', onClick: () => setPrompt('Explain DGCA Air Regulations and pilot licensing requirements') },
    { icon: '🌍', title: 'Aviation Environment Initiatives', onClick: () => setPrompt('Tell me about DGCA environmental initiatives and emission reduction') },
    { icon: '🛡️', title: 'State Safety Programme (SSP)', onClick: () => setPrompt('Explain India\'s State Safety Programme and aviation safety measures') },
    { icon: '🚁', title: 'Drone & Aerosports Regulations', onClick: () => setPrompt('What are the current DGCA regulations for drones and aerosports?') },
  ];

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
      setMessages(prev => [...prev, { role: 'assistant', content: cleaned || 'I’m here to help with DGCA prep. What topic would you like to study?' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I could not reach the AI service. Meanwhile, tell me a DGCA topic (e.g., Air Regulations—Licensing), and I will guide you.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-2 md:px-8">
      <div className="max-w-3xl text-center md:text-left">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          <span className="text-gray-900">Welcome to DGCA Training Portal{firstName ? ', ' : ''} </span>
          {firstName && (
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{firstName}</span>
          )}
        </h1>
        <h2 className="mt-2 text-xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Your Aviation Learning Hub</h2>
        <p className="mt-3 text-sm md:text-base text-gray-600">Explore DGCA regulations, aviation safety, and training resources. Choose a topic below or ask your own question.</p>
      </div>

      <div className="hidden mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 max-w-5xl">
        {suggestions.map((s, i) => (
          <button key={i} onClick={s.onClick} className="text-left p-3 md:p-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all">
            <div className="text-xl md:text-2xl mb-1 md:mb-2">{s.icon}</div>
            <div className="text-xs md:text-sm text-gray-800 leading-snug">{s.title}</div>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="max-w-5xl mt-4 md:mt-6 space-y-2 md:space-y-3 mx-auto md:mx-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`${m.role === 'user' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' : 'bg-white/80 text-gray-900'} shadow rounded-2xl px-3 md:px-4 py-2 md:py-3 max-w-[85%] text-sm md:text-base`}>{m.content}</div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <Card className="p-0 mt-3 md:mt-4 max-w-5xl mx-auto md:mx-0">
        <div className="p-3 md:p-4">
          <label className="sr-only">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Anything about Your Career"
            rows={3}
            className="w-full resize-none border-0 focus:ring-0 outline-none text-sm md:text-base"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
        </div>
        <div className="px-3 md:px-4 pb-3 md:pb-4 flex items-center justify-end gap-2 text-xs md:text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <select className="input-field h-8 md:h-9 py-1 w-24 md:w-32 text-xs md:text-sm">
              <option>DGCA Regulations</option>
              <option>Aviation Safety</option>
              <option>Pilot Training</option>
              <option>Environmental</option>
            </select>
            <Button size="sm" onClick={handleSend} disabled={sending} aria-label="Send" className="text-xs md:text-sm">{sending ? '...' : '➤'}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
