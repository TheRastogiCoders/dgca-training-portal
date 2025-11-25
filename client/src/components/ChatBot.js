import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import debugLog from '../utils/debug';

const ChatBot = forwardRef(({ isOpenByDefault = false }, ref) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(isOpenByDefault);
  const messagesEndRef = useRef(null);

  // Test API connection on component mount
  useEffect(() => {
    const testAPI = async () => {
      try {
        debugLog('Testing AI API connection...');
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Hello' })
        });
        const data = await response.json();
        debugLog('API test successful:', data);
      } catch (error) {
        console.error('API test failed:', error);
      }
    };
    testAPI();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useImperativeHandle(ref, () => ({
    openChat: () => setIsOpen(true),
    closeChat: () => setIsOpen(false),
    toggleChat: () => setIsOpen(prev => !prev)
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      debugLog('Sending message to backend AI API...');
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      debugLog('Received response from AI API:', data);
      const aiMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling AI API:', error);
      console.error('Error details:', error.message);
      
      // Fallback response if API fails (network/offline)
      const fallbackResponse = generateAIResponse(currentInput);
      const aiMessage = {
        id: Date.now() + 1,
        text: fallbackResponse,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userInput) => {
    const lower = (userInput || '').toLowerCase();

    // Greetings
    if (/(^|\b)(hi|hey|hello|hola|namaste)($|\b)/i.test(userInput)) {
      return "Hey! How can I help you today? I'm VIMAANNA AI Assistant.";
    }
    // Small talk
    if (/(how are you|how's it going|how r u|how are u)/i.test(lower)) {
      return "I'm great and ready to help with your aviation learning. What would you like to work on today?";
    }
    if (/(who are you|what is your name|your name)/i.test(lower)) {
      return "I'm VIMAANNA AI, your aviation study assistant. I can explain concepts, plan study schedules, and suggest practice questions.";
    }
    if (/(what can you do|help me|assist)/i.test(lower)) {
      return "I can: 1) explain aviation topics, 2) suggest DGCA study plans, 3) point you to notes, 4) recommend practice tests. What shall we start with?";
    }
    // Thanks / closing
    if (/(thank|thanks|ty|thank you)/i.test(userInput)) {
      return "You're welcome! If you need more help with aviation or DGCA, just ask.";
    }
    if (/(bye|goodbye|see you)/i.test(userInput)) {
      return "Goodbye! Keep practicing and fly high ✈️";
    }

    // Topic buckets
    if (/(dgca|exam|prepare|preparation|study plan)/i.test(lower)) {
      return "DGCA prep tip: Study daily in short sessions. Order: Air Regulations → Navigation → Meteorology → Technical (G/S). Mix question practice with notes, and take a mock test every 3–4 days.";
    }
    if (/(navigation|vor|dme|rnav|gps|dead reckoning|track|heading)/i.test(lower)) {
      return "Navigation quick note: Track = Intended path over ground. To compute heading, correct the desired track for wind using the wind triangle, then add variation/deviation to get compass heading.";
    }
    if (/(met|meteorology|weather|cloud|pressure|wind|front|visibility)/i.test(lower)) {
      return "Meteorology quick note: Pressure ↓ with height; temperature lapse ~2°C/1000 ft (ISA). Unstable air → cumuliform clouds and turbulence; stable air → stratiform clouds and smooth air.";
    }
    // Atmosphere layers Q&A
    if (/(lowest\s+layer\s+of\s+the\s+atmosphere|atmosphere\s+layers|layers\s+of\s+the\s+atmosphere|name\s+the\s+lowest\s+layer)/i.test(lower)) {
      return "The lowest layer of the atmosphere is the Troposphere (≈ sea level to ~11 km/36,000 ft on average). Most weather occurs here and temperature generally decreases with height. Above it is the Stratosphere (to ~50 km) where temperature increases due to ozone absorption.";
    }
    if (/(regulation|rules|atc|air law|license|licence)/i.test(lower)) {
      return "Air Regulations: Know VFR/IFR minima, right‑of‑way rules, ATC clearances, altimeter settings (QNH/QFE/STD), and flight plan requirements for controlled airspace.";
    }
    if (/(technical|engine|systems|aerodynamics|lift|drag|stall)/i.test(lower)) {
      return "Technical note: Stall occurs when the wing exceeds critical angle of attack. Manage with pitch reduction, smooth power as needed, and coordinated flight to avoid secondary stalls.";
    }
    if (/(rtr|rt|radio|telephony|phraseology)/i.test(lower)) {
      return "RTR tip: Keep transmissions concise. Read back clearances with key items: callsign, runway, altitude/heading, squawk. Use standard phraseology (e.g., \"Request taxi\").";
    }
    // Quick aviation knowledge base (regex → concise explainer)
    const kb = [
      [/\bvfr\b.*(min|minimum|minima)|visual\s+flight\s+rules/i, 'VFR minima (typical ICAO): Class E/G day below 10,000 ft: 5 km vis, 1000 ft vertical and 1500 m horizontal from clouds. Check local DGCA AIP for specific India values.'],
      [/(cloud\s*types|types\s*of\s*clouds|cloud\s*classification)/i, 'Cloud types: High (Cirrus, Cirrostratus, Cirrocumulus), Middle (Altostratus, Altocumulus), Low (Stratus, Stratocumulus, Nimbostratus), Vertical (Cumulus, Cumulonimbus).'],
      [/(lapse\s*rate|isa\s*lapse)/i, 'Standard (ISA) temperature lapse rate ≈ 2°C per 1000 ft in the Troposphere. Dry adiabatic ≈ 3°C/1000 ft; moist adiabatic ≈ 1.5°C/1000 ft (varies).'],
      [/(qnh|qfe|std|standard\s*pressure|altimeter\s*setting)/i, 'Altimeter settings: QNH = sea‑level pressure (reads field elevation on ground). QFE = field pressure (reads zero on field). STD = 1013 hPa/29.92 inHg above transition altitude for flight levels.'],
      [/(vor|vor\/dme|dme)\b/i, 'VOR provides azimuth (radials) to/from the station; DME adds slant‑range distance. Intersect a radial with DME to fix position.'],
      [/(ils|localizer|glideslope)/i, 'ILS: Localizer provides lateral guidance to runway centerline; Glideslope provides vertical path (~3°). Category minima depend on equipment and training.'],
      [/(right\s*of\s*way|right-of-way|give\s*way)/i, 'Right‑of‑way: Aircraft in distress has priority; converging different categories → balloons > gliders > airships > powered; head‑on: both turn right; overtaking: overtaker passes to the right.'],
      [/(metar|taf)\b/i, 'METAR = routine aviation weather report; TAF = terminal aerodrome forecast. Decode wind, visibility, weather, clouds, temperature/dew point, QNH, and significant changes.'],
      [/(wake\s*turbulence|heavy\s*jet\s*wake)/i, 'Wake turbulence: Strongest behind heavy/slow/clean aircraft—especially during takeoff/landing. Rotate before and stay above the preceding aircraft’s path; land beyond their touchdown point.'],
      [/(airspace\s*class|class\s*a|b|c|d|e|g)/i, 'Airspace basics: Class A IFR only; B/C controlled with ATC clearance; D requires two‑way comm; E controlled for IFR; G uncontrolled. Local DGCA specifics may vary.'],
      [/(squawk|transponder|code)\s*(7500|7600|7700)/i, 'Transponder emergency codes: 7500 hijack, 7600 radio failure, 7700 general emergency.'],
      [/(density\s*altitude)/i, 'Density altitude = pressure altitude corrected for non‑standard temperature; higher DA reduces aircraft performance (longer takeoff roll, reduced climb).'],
    ];
    for (const [pattern, answer] of kb) {
      if (pattern.test(lower)) return answer;
    }

    // Materials / site actions
    if (/(book|notes|materials|pdf|library)/i.test(lower)) {
      return "You can browse study PDFs in the Library and practice by subject or book (IC Joshi / Oxford). Want me to take you to the Library or Question Bank?";
    }
    if (/(test|mock|practice|questions|quiz)/i.test(lower)) {
      return "Try a practice test from the Practice page. Choose AI Generated, Admin Questions, or Book Questions for targeted drills.";
    }

    // Generic explainer for unknown topics
    const explainMatch = lower.match(/^(what is|define|explain)\s+(.+)/i);
    if (explainMatch && explainMatch[2]) {
      const topic = userInput.replace(/^(what is|define|explain)\s+/i, '').replace(/\?+$/, '').trim();
      return `Here’s a quick, plain‑English explanation of ${topic} (in an aviation learning context):\n\n- Meaning: ${topic} is a concept/topic you might encounter while studying.\n- Why it matters: Understanding this helps build strong theory for exams and safe operations.\n- Tip: Break the idea into definitions, relations to performance/regulations, and a small example.\n\nIf you tell me the subject (Navigation/Meteorology/Regulations/Technical), I’ll tailor this explanation further.`;
    }

    // Default helpful echo
    return `Got it: "${userInput}". I can give study tips, explain concepts, or point to materials. Say a subject (Navigation / Meteorology / Regulations / Technical) or ask a specific concept (e.g., \"explain VOR\").`;
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>

      {/* Simple Chat Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 transition-all duration-300 opacity-100"
          style={{ 
            background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(37, 99, 235, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%)'
          }}
        >
        {/* Particle Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-500 rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-blue-600 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-1/4 right-1/2 w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/5 w-1 h-1 bg-blue-500 rounded-full opacity-50 animate-bounce"></div>
        </div>
        
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className={`w-full max-w-4xl h-[80vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-blue-100 transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
            {/* Simple Chat Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">VIMAANNA AI</h2>
                    <p className="text-green-100 text-sm">Online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearChat}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Clear Chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Close Chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area with chat wallpaper */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.94), rgba(255,255,255,0.94)), radial-gradient(circle at 25px 25px, rgba(0,0,0,0.03) 2px, transparent 3px)', backgroundSize: 'auto, 28px 28px'}}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-600 mt-16">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    Welcome to VIMAANNA AI
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                    Your study assistant for aviation learning. Ask me about DGCA exams, 
                    flight training, or any aviation topics.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 bg-white rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-2">Study Help</h4>
                      <p className="text-sm text-gray-600">"Help with DGCA exam preparation"</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-2">Aviation Topics</h4>
                      <p className="text-sm text-gray-600">"Explain weather patterns in aviation"</p>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-[75%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${message.sender === 'user' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                        {message.sender === 'user' ? 'U' : 'AI'}
                      </div>
                      {/* Bubble */}
                      <div className={`px-3 py-2 text-sm leading-relaxed shadow ${message.sender === 'user' ? 'bg-[#DCF8C6] rounded-2xl rounded-br-none' : 'bg-white rounded-2xl rounded-bl-none border border-gray-200'}`}>
                        <p className="whitespace-pre-line text-gray-900">{message.text}</p>
                        <div className="text-[10px] text-gray-500 mt-1 text-right">{message.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      AI
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - WhatsApp-like */}
            <div className="p-4 bg-[#f0f2f5] border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message"
                    className="w-full px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm border border-gray-200"
                    disabled={isTyping}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  );
});

ChatBot.displayName = 'ChatBot';

export default ChatBot;
