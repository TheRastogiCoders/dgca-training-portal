import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';

const books = [
  { 
    slug: 'ic-joshi', 
    name: 'IC Joshi', 
    icon: '📖', 
    color: 'from-blue-500 to-blue-600',
    description: 'Comprehensive aviation reference guide',
    features: ['Detailed explanations', 'DGCA aligned', 'Expert reviewed'],
    questions: '500+',
    difficulty: 'Medium to Hard'
  },
  { 
    slug: 'oxford', 
    name: 'Oxford Aviation', 
    icon: '📘', 
    color: 'from-emerald-500 to-green-600',
    description: 'International aviation standards',
    features: ['Global standards', 'Modern approach', 'Visual learning'],
    questions: '400+',
    difficulty: 'Easy to Medium'
  },
];

const subjectData = {
  'air-regulations': {
    name: 'Air Regulations',
    icon: '📋',
    color: 'from-blue-500 to-blue-600',
    description: 'Civil Aviation Rules & Regulations',
    topics: ['Civil Aviation Rules', 'Air Traffic Control', 'Flight Operations', 'Aircraft Registration', 'Licensing']
  },
  'air-navigation': {
    name: 'Air Navigation',
    icon: '🧭',
    color: 'from-green-500 to-green-600',
    description: 'Navigation Systems & Procedures',
    topics: ['Dead Reckoning', 'VOR/DME Navigation', 'GPS & RNAV', 'Flight Planning', 'Radio Navigation']
  },
  'meteorology': {
    name: 'Meteorology',
    icon: '🌤️',
    color: 'from-yellow-500 to-orange-500',
    description: 'Weather Systems & Aviation Weather',
    topics: ['Atmosphere & Pressure', 'Cloud Types', 'Weather Fronts', 'Wind Systems', 'Weather Hazards']
  },
  'technical-general': {
    name: 'Technical General',
    icon: '⚙️',
    color: 'from-red-500 to-red-600',
    description: 'Aircraft Systems & General Knowledge',
    topics: ['Aircraft Engines', 'Electrical Systems', 'Hydraulic Systems', 'Aerodynamics', 'Aircraft Structures']
  },
  'technical-specific': {
    name: 'Technical Specific',
    icon: '✈️',
    color: 'from-purple-500 to-purple-600',
    description: 'Aircraft Type Specific Knowledge',
    topics: ['Cessna 172 Systems', 'Piper Cherokee', 'Multi-Engine Aircraft', 'Turboprop Systems', 'Jet Aircraft']
  },
  'radio-telephony': {
    name: 'Radio Telephony (RTR)-A',
    icon: '📻',
    color: 'from-cyan-500 to-cyan-600',
    description: 'Radio Communication Procedures',
    topics: ['Standard Phraseology', 'ATC Communications', 'Emergency Procedures', 'Radio Equipment', 'International Procedures']
  }
};

// Helper to create URL-friendly slugs from names
const slugify = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// Default first chapter per subject (matches AIPracticeChapters order)
const defaultChapterBySubject = {
  'air-regulations': slugify('Civil Aviation Rules'),
  'air-navigation': slugify('Dead Reckoning'),
  'meteorology': slugify('Atmosphere & Pressure'),
  'technical-general': slugify('Aircraft Engines'),
  'technical-specific': slugify('Cessna 172 Systems'),
  'radio-telephony': slugify('Standard Phraseology')
};

const AIPracticeBooks = () => {
  const { subjectSlug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const [practiceSettings, setPracticeSettings] = useState({
    questionCount: 10,
    difficulty: 'adaptive',
    timeLimit: 'unlimited',
    showExplanations: true
  });

  const subject = subjectData[subjectSlug] || {
    name: 'Unknown Subject',
    icon: '📚',
    color: 'from-gray-500 to-gray-600',
    description: 'Aviation subject',
    topics: []
  };

  const handleBookClick = (book) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedBook(book);
    setShowBookDetails(true);
  };

  const startAIPractice = () => {
    if (selectedBook) {
      // Jump directly to runner with the first chapter for this subject
      const chapterSlug = defaultChapterBySubject[subjectSlug] || 'chapter-1';
      navigate(`/practice-test/ai/${subjectSlug}/${selectedBook.slug}/${chapterSlug}`, {
        state: { practiceSettings }
      });
    }
  };

  const handleSettingChange = (setting, value) => {
    setPracticeSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Navigation */}
            <div className="mb-6">
              <Link 
                to="/practice-test/ai"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to AI Subjects
              </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-12">
              <div className={`w-20 h-20 bg-gradient-to-r ${subject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6`}>
                {subject.icon}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                {subject.name} - AI Practice
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                {subject.description}
              </p>
              {!isAuthenticated && (
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-full mb-4">
                  <span className="text-yellow-800 font-medium text-sm">🔒 Login required to start AI practice</span>
                </div>
              )}
            </div>

            {/* Subject Topics Overview */}
            <Card className="p-8 mb-12 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Topics Covered</h2>
                <p className="text-gray-600">AI will generate questions from these key areas</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {subject.topics.map((topic, index) => (
                  <div key={index} className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg mx-auto mb-2">
                      {index + 1}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">{topic}</h3>
                  </div>
                ))}
              </div>
            </Card>

            {/* Book Selection */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Choose Your Reference Book
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {books.map((book) => (
                  <Card 
                    key={book.slug} 
                    className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                    onClick={() => handleBookClick(book)}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 bg-gradient-to-r ${book.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        {book.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                        {book.name}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {book.description}
                      </p>
                      
                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {book.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{book.questions}</div>
                          <div className="text-xs text-gray-500">Questions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{book.difficulty}</div>
                          <div className="text-xs text-gray-500">Difficulty</div>
                        </div>
                      </div>
                      
                      <button className={`w-full py-3 px-6 bg-gradient-to-r ${book.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}>
                        Select This Book
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Book Details Modal */}
            {showBookDetails && selectedBook && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="text-center mb-8">
                    <div className={`w-24 h-24 bg-gradient-to-r ${selectedBook.color} rounded-2xl flex items-center justify-center text-white text-5xl mx-auto mb-4`}>
                      {selectedBook.icon}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedBook.name}</h2>
                    <p className="text-gray-600">{selectedBook.description}</p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Book Features */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Book Features</h3>
                      <div className="space-y-3">
                        {selectedBook.features.map((feature, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium text-gray-900">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Practice Settings */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Practice Settings</h3>
                      <div className="space-y-4">
                        {/* Question Count */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Number of Questions
                          </label>
                          <select
                            value={practiceSettings.questionCount}
                            onChange={(e) => handleSettingChange('questionCount', parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value={5}>5 Questions (Quick Practice)</option>
                            <option value={10}>10 Questions (Standard)</option>
                            <option value={20}>20 Questions (Extended)</option>
                            <option value={50}>50 Questions (Comprehensive)</option>
                          </select>
                        </div>

                        {/* Difficulty */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Difficulty Level
                          </label>
                          <select
                            value={practiceSettings.difficulty}
                            onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="adaptive">Adaptive (AI adjusts)</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>

                        {/* Time Limit */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Time Limit
                          </label>
                          <select
                            value={practiceSettings.timeLimit}
                            onChange={(e) => handleSettingChange('timeLimit', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="unlimited">Unlimited Time</option>
                            <option value="30">30 seconds per question</option>
                            <option value="60">1 minute per question</option>
                            <option value="90">1.5 minutes per question</option>
                          </select>
                        </div>

                        {/* Show Explanations */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showExplanations"
                            checked={practiceSettings.showExplanations}
                            onChange={(e) => handleSettingChange('showExplanations', e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor="showExplanations" className="ml-2 text-sm font-medium text-gray-700">
                            Show detailed explanations after each question
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Practice Preview */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">🤖 AI Practice Preview</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{practiceSettings.questionCount} Questions</div>
                        <div className="text-gray-600">Total questions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{practiceSettings.difficulty}</div>
                        <div className="text-gray-600">Difficulty level</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{practiceSettings.timeLimit === 'unlimited' ? 'No limit' : `${practiceSettings.timeLimit}s`}</div>
                        <div className="text-gray-600">Per question</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={startAIPractice}
                      className={`flex-1 py-4 px-8 bg-gradient-to-r ${selectedBook.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Start AI Practice
                      </div>
                    </button>
                    <button
                      onClick={() => setShowBookDetails(false)}
                      className="px-8 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Benefits */}
            <Card className="p-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Choose AI Practice?</h3>
                <p className="text-gray-600">Experience the future of aviation exam preparation</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    🎯
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Adaptive Learning</h4>
                  <p className="text-gray-600 text-sm">AI adjusts difficulty based on your performance</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    🧠
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Personalized Path</h4>
                  <p className="text-gray-600 text-sm">Focus on areas that need improvement</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    📊
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Real-time Analytics</h4>
                  <p className="text-gray-600 text-sm">Instant feedback and performance insights</p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIPracticeBooks;


