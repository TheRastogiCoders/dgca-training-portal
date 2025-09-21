import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';

const subjects = [
  { 
    slug: 'air-regulations', 
    name: 'Air Regulations', 
    icon: '📋', 
    color: 'from-blue-500 to-blue-600',
    description: 'Civil Aviation Rules & Regulations',
    questions: 'Unlimited',
    difficulty: 'Adaptive',
    features: ['Smart difficulty adjustment', 'Real-time feedback', 'Performance tracking']
  },
  { 
    slug: 'air-navigation', 
    name: 'Air Navigation', 
    icon: '🧭', 
    color: 'from-green-500 to-green-600',
    description: 'Navigation Systems & Procedures',
    questions: 'Unlimited',
    difficulty: 'Adaptive',
    features: ['Personalized learning path', 'Weakness identification', 'Progress analytics']
  },
  { 
    slug: 'meteorology', 
    name: 'Meteorology', 
    icon: '🌤️', 
    color: 'from-yellow-500 to-orange-500',
    description: 'Weather Systems & Aviation Weather',
    questions: 'Unlimited',
    difficulty: 'Adaptive',
    features: ['Weather pattern analysis', 'Concept reinforcement', 'Visual learning']
  },
  { 
    slug: 'technical-general', 
    name: 'Technical General', 
    icon: '⚙️', 
    color: 'from-red-500 to-red-600',
    description: 'Aircraft Systems & General Knowledge',
    questions: 'Unlimited',
    difficulty: 'Adaptive',
    features: ['System understanding', 'Technical concepts', 'Practical applications']
  },
  { 
    slug: 'technical-specific', 
    name: 'Technical Specific', 
    icon: '✈️', 
    color: 'from-purple-500 to-purple-600',
    description: 'Aircraft Type Specific Knowledge',
    questions: 'Unlimited',
    difficulty: 'Adaptive',
    features: ['Aircraft-specific content', 'Detailed explanations', 'Expert insights']
  },
  { 
    slug: 'radio-telephony', 
    name: 'Radio Telephony (RTR)-A', 
    icon: '📻', 
    color: 'from-cyan-500 to-cyan-600',
    description: 'Radio Communication Procedures',
    questions: 'Unlimited',
    difficulty: 'Adaptive',
    features: ['Communication protocols', 'Phraseology practice', 'Real-world scenarios']
  },
];

const AIPracticeSubject = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);

  const handleSubjectClick = (subject) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedSubject(subject);
    setShowFeatures(true);
  };

  const startAIPractice = () => {
    if (selectedSubject) {
      navigate(`/practice-test/ai/${selectedSubject.slug}`);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                AI Generated Questions
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Smart adaptive practice powered by VIMAANNA AI
              </p>
              {!isAuthenticated && (
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-full mb-4">
                  <span className="text-yellow-800 font-medium text-sm">🔒 Login required to access AI practice</span>
                </div>
              )}
            </div>

            {/* AI Features Overview */}
            <Card className="p-8 mb-12 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-4">
                  🤖
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced AI Learning System</h2>
                <p className="text-gray-600">Experience the future of aviation exam preparation</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    🎯
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Adaptive Difficulty</h3>
                  <p className="text-gray-600 text-sm">AI adjusts question difficulty based on your performance</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    🧠
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Personalized Learning</h3>
                  <p className="text-gray-600 text-sm">Custom learning paths tailored to your strengths and weaknesses</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    📊
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Analytics</h3>
                  <p className="text-gray-600 text-sm">Instant feedback and performance insights</p>
                </div>
              </div>
            </Card>

            {/* Subject Selection */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Choose Your Subject
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                  <Card 
                    key={subject.slug} 
                    className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                    onClick={() => handleSubjectClick(subject)}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 bg-gradient-to-r ${subject.color} rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        {subject.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {subject.description}
                      </p>
                      
                      {/* Features */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">AI Features:</h4>
                        <ul className="space-y-1 text-xs text-gray-600">
                          {subject.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <svg className="w-3 h-3 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{subject.questions}</div>
                          <div className="text-xs text-gray-500">Questions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{subject.difficulty}</div>
                          <div className="text-xs text-gray-500">Difficulty</div>
                        </div>
                      </div>
                      
                      <button className={`w-full py-2 px-4 bg-gradient-to-r ${subject.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}>
                        Start AI Practice
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Selected Subject Features Modal */}
            {showFeatures && selectedSubject && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-r ${selectedSubject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-4`}>
                      {selectedSubject.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedSubject.name}</h2>
                    <p className="text-gray-600">{selectedSubject.description}</p>
                  </div>

                  <div className="space-y-6">
                    {/* AI Features */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">AI-Powered Features</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedSubject.features.map((feature, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* How AI Works */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">How AI Adapts to You</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-purple-600 font-bold text-sm">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Initial Assessment</h4>
                            <p className="text-sm text-gray-600">AI analyzes your starting knowledge level</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-purple-600 font-bold text-sm">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Adaptive Questioning</h4>
                            <p className="text-sm text-gray-600">Questions adjust difficulty based on your responses</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-purple-600 font-bold text-sm">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Personalized Learning</h4>
                            <p className="text-sm text-gray-600">Focus on areas that need improvement</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                      <button
                        onClick={startAIPractice}
                        className={`flex-1 py-3 px-6 bg-gradient-to-r ${selectedSubject.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                      >
                        Start AI Practice
                      </button>
                      <button
                        onClick={() => setShowFeatures(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Back to Practice */}
            <div className="text-center">
              <Link 
                to="/practice-test"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Practice Tests
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIPracticeSubject;


