import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const InlineChat = forwardRef((props, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Optional welcome message like chat apps
  useEffect(() => {
    const welcome = props?.welcome !== false;
    if (welcome) {
      setMessages([{
        id: Date.now() - 1,
        sender: 'ai',
        text: 'I can help with aviation topics, DGCA exam prep, study materials, and practice questions. Could you share a specific subject or concept?',
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    sendMessage: (text) => handleSend(text)
  }));

  const handleSend = async (text) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg = { id: Date.now(), text: content, sender: 'user', timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: content }) });
      const data = await res.json();
      const aiMsg = { id: Date.now() + 1, text: data.response || '...', sender: 'ai', timestamp: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const aiMsg = { id: Date.now() + 1, text: 'Network error. Please try again.', sender: 'ai', timestamp: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const onSubmit = (e) => { e.preventDefault(); handleSend(); };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 shadow-xl">
      <div className="p-4 border-b border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900">VIMAANNA AI</h3>
        <p className="text-xs text-gray-500">Ask anything about aviation</p>
      </div>
      <div className="h-96 overflow-y-auto p-4 space-y-2" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), radial-gradient(circle at 25px 25px, rgba(0,0,0,0.03) 2px, transparent 3px)', backgroundSize: 'auto, 28px 28px'}}>
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3 py-2 text-sm leading-relaxed shadow ${m.sender === 'user' ? 'bg-[#DCF8C6] rounded-2xl rounded-br-none' : 'bg-white rounded-2xl rounded-bl-none border border-gray-200'}`}>
              <p className="text-gray-900 whitespace-pre-line">{m.text}</p>
              <div className="text-[10px] text-gray-500 mt-1 text-right">{m.timestamp}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-3 py-2 rounded-2xl rounded-bl-none border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 bg-[#f0f2f5] border-t border-gray-200">
        <form onSubmit={onSubmit} className="flex items-center space-x-2">
          <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type a message" className="flex-1 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm border border-gray-200" />
          <button type="submit" disabled={!input.trim()} className="w-10 h-10 bg-green-600 rounded-full text-white hover:bg-green-700 disabled:opacity-50">→</button>
        </form>
      </div>
    </div>
  );
});

InlineChat.displayName = 'InlineChat';

export default InlineChat;


