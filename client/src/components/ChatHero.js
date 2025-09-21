import React, { useState, useRef, useEffect } from 'react';

const ChatHero = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [quickAskValue, setQuickAskValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle the initial ask/search
  const handleQuickAsk = (question) => {
    if (!question.trim()) return;
    setShowChat(true);
    const initialMessage = {
      id: 1,
      text: "I can help with aviation topics, DGCA exam prep, study materials, and practice questions. Could you share a specific subject or concept?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString()
    };
    const userMessage = {
      id: 2,
      text: question,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages([initialMessage, userMessage]);
    setQuickAskValue('');
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = {
        id: 3,
        text: "That's a great question! I can help you with that aviation topic. Let me provide you with some detailed information and study resources.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle sending a message in chat
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "That's a great question! I can help you with that aviation topic. Let me provide you with some detailed information and study resources.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen w-full">
      {/* Welcome and Search Bar (centered, only before chat) */}
      {!showChat && (
        <div className="flex flex-col items-center justify-center w-full animate-fade-in-up">
          <h1 className="font-bold text-gray-900 mb-2 text-4xl md:text-5xl text-center">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">VIMAANNA</span>
          </h1>
          <p className="text-gray-600 mb-8 text-lg md:text-xl text-center">Your Gateway to Aviation Excellence</p>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleQuickAsk(quickAskValue);
            }}
            className="w-full max-w-xl flex items-center bg-white/80 backdrop-blur-lg rounded-full border border-blue-100 shadow-lg overflow-hidden px-2 py-1"
          >
            <input
              type="text"
              value={quickAskValue}
              onChange={e => setQuickAskValue(e.target.value)}
              placeholder="Ask VIMAANNA about DGCA, navigation, met..."
              className="flex-1 px-5 py-3 bg-transparent focus:outline-none text-gray-800 text-base"
            />
            <button
              type="submit"
              className="mx-2 my-1 px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
            >
              Ask
            </button>
          </form>
        </div>
      )}

      {/* Chat Panel (centered, modern, glassmorphism, only after chat starts) */}
      {showChat && (
        <div className="w-full max-w-md flex flex-col rounded-3xl shadow-2xl mx-auto animate-fade-in-up"
             style={{ minHeight: 480, maxHeight: 600, background: 'rgba(255,255,255,0.60)', backdropFilter: 'blur(18px)' }}
        >
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M9.663 17h4.673" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">VIMAANNA AI</h2>
              <p className="text-gray-500 text-xs">Ask anything about aviation</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 pb-2 pt-2 space-y-2 custom-scrollbar" style={{ minHeight: 200 }}>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`max-w-[80%] flex flex-col items-${message.sender === 'user' ? 'end' : 'start'}`}>
                  <div className={
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-2xl rounded-br-none px-4 py-2 text-sm shadow-md'
                      : 'bg-white/90 text-gray-900 rounded-2xl rounded-bl-none border border-gray-200 px-4 py-2 text-sm shadow'
                  }>
                    <p className="whitespace-pre-line break-words">{message.text}</p>
                    <div className={`text-[10px] mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'} text-right`}>{message.timestamp}</div>
                  </div>
                </div>
              </div>
            ))}
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] flex flex-col items-start">
                  <div className="bg-white/90 text-gray-900 rounded-2xl rounded-bl-none border border-gray-200 px-4 py-2 text-sm shadow">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area (attached to bottom of chat panel) */}
          <div className="px-4 pb-6 pt-2">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Type a message"
                  className="w-full px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm border border-gray-200 shadow"
                  disabled={isTyping}
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHero;
