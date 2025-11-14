import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';

const friendly = (slug) => (slug || '')
  .split('-')
  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
  .join(' ');

const chapterData = {
  'air-regulations': [
    { name: 'Civil Aviation Rules', description: 'Fundamental aviation regulations and procedures', questions: '120+', difficulty: 'Medium', topics: ['CAR Rules', 'Flight Rules', 'Airspace'] },
    { name: 'Air Traffic Control', description: 'ATC procedures and communication protocols', questions: '100+', difficulty: 'Hard', topics: ['ATC Procedures', 'Clearances', 'Separation'] },
    { name: 'Flight Operations', description: 'Flight planning and operational procedures', questions: '90+', difficulty: 'Medium', topics: ['Flight Planning', 'Operations', 'Procedures'] },
    { name: 'Aircraft Registration', description: 'Aircraft documentation and registration', questions: '80+', difficulty: 'Easy', topics: ['Registration', 'Certificates', 'Documents'] },
    { name: 'Licensing & Certification', description: 'Pilot licensing and certification requirements', questions: '110+', difficulty: 'Medium', topics: ['PPL', 'CPL', 'ATPL', 'Medical'] }
  ],
  'air-navigation': [
    { name: 'Dead Reckoning', description: 'Basic navigation calculations and plotting', questions: '100+', difficulty: 'Medium', topics: ['DR Calculations', 'Plotting', 'Wind Triangle'] },
    { name: 'VOR/DME Navigation', description: 'Radio navigation aids and procedures', questions: '120+', difficulty: 'Hard', topics: ['VOR', 'DME', 'NDB', 'ILS'] },
    { name: 'GPS & RNAV', description: 'Modern satellite navigation systems', questions: '90+', difficulty: 'Medium', topics: ['GPS', 'RNAV', 'GNSS', 'WAAS'] },
    { name: 'Flight Planning', description: 'Route planning and fuel calculations', questions: '110+', difficulty: 'Hard', topics: ['Route Planning', 'Fuel Planning', 'Alternates'] },
    { name: 'Radio Navigation', description: 'Radio aids and navigation procedures', questions: '95+', difficulty: 'Medium', topics: ['Radio Aids', 'Procedures', 'Approaches'] }
  ],
  'meteorology': [
    { name: 'Atmosphere & Pressure', description: 'Basic atmospheric principles and pressure systems', questions: '80+', difficulty: 'Easy', topics: ['Atmosphere', 'Pressure', 'Density'] },
    { name: 'Cloud Types & Formation', description: 'Cloud classification and formation processes', questions: '90+', difficulty: 'Medium', topics: ['Cloud Types', 'Formation', 'Precipitation'] },
    { name: 'Weather Fronts', description: 'Frontal systems and weather patterns', questions: '85+', difficulty: 'Medium', topics: ['Cold Fronts', 'Warm Fronts', 'Occlusions'] },
    { name: 'Wind Systems', description: 'Wind patterns and atmospheric circulation', questions: '75+', difficulty: 'Easy', topics: ['Wind Patterns', 'Circulation', 'Local Winds'] },
    { name: 'Weather Hazards', description: 'Dangerous weather phenomena and avoidance', questions: '100+', difficulty: 'Hard', topics: ['Thunderstorms', 'Icing', 'Turbulence'] }
  ],
  'technical-general': [
    { name: 'Aircraft Engines', description: 'Engine systems and performance characteristics', questions: '120+', difficulty: 'Hard', topics: ['Piston Engines', 'Turbines', 'Performance'] },
    { name: 'Electrical Systems', description: 'Aircraft electrical systems and components', questions: '100+', difficulty: 'Medium', topics: ['Electrical', 'Batteries', 'Generators'] },
    { name: 'Hydraulic Systems', description: 'Hydraulic power and control systems', questions: '85+', difficulty: 'Medium', topics: ['Hydraulics', 'Pumps', 'Actuators'] },
    { name: 'Aerodynamics', description: 'Principles of flight and aerodynamic forces', questions: '110+', difficulty: 'Hard', topics: ['Lift', 'Drag', 'Stability'] },
    { name: 'Aircraft Structures', description: 'Aircraft construction and materials', questions: '95+', difficulty: 'Medium', topics: ['Materials', 'Construction', 'Loads'] }
  ],
  'technical-specific': [
    { name: 'Cessna 172 Systems', description: 'Cessna 172 specific systems and procedures', questions: '100+', difficulty: 'Medium', topics: ['Systems', 'Procedures', 'Limitations'] },
    { name: 'Piper Cherokee', description: 'Piper Cherokee aircraft systems', questions: '90+', difficulty: 'Medium', topics: ['Systems', 'Procedures', 'Limitations'] },
    { name: 'Multi-Engine Aircraft', description: 'Multi-engine aircraft systems and procedures', questions: '120+', difficulty: 'Hard', topics: ['Engines', 'Systems', 'Procedures'] },
    { name: 'Turboprop Systems', description: 'Turboprop engine and aircraft systems', questions: '110+', difficulty: 'Hard', topics: ['Turboprop', 'Systems', 'Performance'] },
    { name: 'Jet Aircraft Basics', description: 'Basic jet aircraft systems and operations', questions: '95+', difficulty: 'Hard', topics: ['Jet Engines', 'Systems', 'Operations'] }
  ],
  'radio-telephony': [
    { name: 'Standard Phraseology', description: 'Standard radio communication procedures', questions: '80+', difficulty: 'Easy', topics: ['Phraseology', 'Procedures', 'Standards'] },
    { name: 'ATC Communications', description: 'Air traffic control communication protocols', questions: '100+', difficulty: 'Medium', topics: ['ATC', 'Clearances', 'Instructions'] },
    { name: 'Emergency Procedures', description: 'Emergency communication procedures', questions: '70+', difficulty: 'Medium', topics: ['Emergencies', 'Mayday', 'Pan Pan'] },
    { name: 'Radio Equipment', description: 'Radio equipment operation and procedures', questions: '85+', difficulty: 'Easy', topics: ['Equipment', 'Operation', 'Maintenance'] },
    { name: 'International Procedures', description: 'International communication standards', questions: '90+', difficulty: 'Medium', topics: ['ICAO', 'International', 'Standards'] }
  ]
};

const subjectData = {
  'air-regulations': { name: 'Air Regulations', icon: '📋', color: 'from-blue-500 to-blue-600' },
  'air-navigation': { name: 'Air Navigation', icon: '🧭', color: 'from-green-500 to-green-600' },
  'meteorology': { name: 'Meteorology', icon: '🌤️', color: 'from-yellow-500 to-orange-500' },
  'technical-general': { name: 'Technical General', icon: '⚙️', color: 'from-red-500 to-red-600' },
  'technical-specific': { name: 'Technical Specific', icon: '✈️', color: 'from-purple-500 to-purple-600' },
  'radio-telephony': { name: 'Radio Telephony', icon: '📻', color: 'from-cyan-500 to-cyan-600' }
};

const bookData = {
  'ic-joshi': { name: 'IC Joshi', icon: '📖', color: 'from-blue-500 to-blue-600' },
  'oxford': { name: 'Oxford Aviation', icon: '📘', color: 'from-emerald-500 to-green-600' }
};

const slugify = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const AIPracticeChapters = () => {
  const { subjectSlug, bookSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showChapterDetails, setShowChapterDetails] = useState(false);

  const subject = subjectData[subjectSlug] || { name: 'Unknown Subject', icon: '📚', color: 'from-gray-500 to-gray-600' };
  const book = bookData[bookSlug] || { name: 'Unknown Book', icon: '📖', color: 'from-gray-500 to-gray-600' };
  const practiceSettings = location.state?.practiceSettings || {
    questionCount: 10,
    difficulty: 'adaptive',
    timeLimit: 'unlimited',
    showExplanations: true
  };

  const chapters = useMemo(() => {
    return (chapterData[subjectSlug] || []).map((chapter, idx) => ({
      id: idx + 1,
      name: chapter.name,
      slug: slugify(chapter.name),
      description: chapter.description,
      questions: chapter.questions,
      difficulty: chapter.difficulty,
      topics: chapter.topics
    }));
  }, [subjectSlug]);

  const handleChapterClick = (chapter) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedChapter(chapter);
    setShowChapterDetails(true);
  };

  const startChapterPractice = () => {
    if (selectedChapter) {
      navigate(`/pyq/ai/${subjectSlug}/${bookSlug}/${selectedChapter.slug}`, {
        state: { 
          practiceSettings,
          chapter: selectedChapter,
          subject,
          book
        }
      });
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
            {/* Breadcrumb Navigation */}
            <div className="mb-6">
              <nav className="flex items-center space-x-2 text-sm">
                <Link to="/pyq/ai" className="text-blue-600 hover:text-blue-700">AI Subjects</Link>
                <span className="text-gray-400">›</span>
                <Link to={`/pyq/ai/${subjectSlug}`} className="text-blue-600 hover:text-blue-700">{subject.name}</Link>
                <span className="text-gray-400">›</span>
                <span className="text-gray-600">Chapters</span>
              </nav>
            </div>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${subject.color} rounded-2xl flex items-center justify-center text-white text-3xl mr-4`}>
                  {subject.icon}
                </div>
                <div className={`w-16 h-16 bg-gradient-to-r ${book.color} rounded-2xl flex items-center justify-center text-white text-3xl`}>
                  {book.icon}
            </div>
          </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Choose Your Chapter
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                {subject.name} • {book.name}
              </p>
              <p className="text-gray-500">
                AI will generate questions based on your selected chapter
              </p>
              {!isAuthenticated && (
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-full mt-4">
                  <span className="text-yellow-800 font-medium text-sm">🔒 Login required to start practice</span>
                </div>
              )}
            </div>

            {/* Practice Settings Summary */}
            <Card className="p-6 mb-12 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Your Practice Settings</h2>
                <p className="text-gray-600">These settings will be applied to your AI practice session</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-blue-600">{practiceSettings.questionCount}</div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-purple-600 capitalize">{practiceSettings.difficulty}</div>
                  <div className="text-xs text-gray-500">Difficulty</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-green-600">{practiceSettings.timeLimit === 'unlimited' ? 'No limit' : `${practiceSettings.timeLimit}s`}</div>
                  <div className="text-xs text-gray-500">Per Question</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-orange-600">{practiceSettings.showExplanations ? 'Yes' : 'No'}</div>
                  <div className="text-xs text-gray-500">Explanations</div>
                </div>
            </div>
            </Card>

            {/* Chapter Selection */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Available Chapters
              </h2>
              
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((chapter) => (
                  <Card 
                    key={chapter.slug} 
                    className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                    onClick={() => handleChapterClick(chapter)}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        {chapter.id}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {chapter.name}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {chapter.description}
                      </p>
                      
                      {/* Topics */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Topics:</h4>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {chapter.topics.slice(0, 3).map((topic, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {topic}
                            </span>
                          ))}
                          {chapter.topics.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{chapter.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{chapter.questions}</div>
                          <div className="text-xs text-gray-500">Questions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{chapter.difficulty}</div>
                          <div className="text-xs text-gray-500">Difficulty</div>
                        </div>
                      </div>
                      
                      <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                        Start Chapter Practice
                      </button>
                    </div>
                </Card>
              ))}
            </div>
            </div>

            {/* Chapter Details Modal */}
            {showChapterDetails && selectedChapter && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
                      {selectedChapter.id}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedChapter.name}</h2>
                    <p className="text-gray-600">{selectedChapter.description}</p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Chapter Topics */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Chapter Topics</h3>
                      <div className="space-y-3">
                        {selectedChapter.topics.map((topic, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Practice Preview */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Practice Preview</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2">AI-Generated Questions</h4>
                          <p className="text-blue-700 text-sm">Questions will be dynamically generated based on this chapter's content and your performance level.</p>
                        </div>
                        
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-purple-900 mb-2">Adaptive Learning</h4>
                          <p className="text-purple-700 text-sm">AI will adjust question difficulty based on your responses to optimize your learning experience.</p>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-2">Real-time Feedback</h4>
                          <p className="text-green-700 text-sm">Get instant explanations and performance insights after each question.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chapter Stats */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Chapter Statistics</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{selectedChapter.questions}</div>
                        <div className="text-sm text-gray-600">Available Questions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{selectedChapter.difficulty}</div>
                        <div className="text-sm text-gray-600">Difficulty Level</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{selectedChapter.topics.length}</div>
                        <div className="text-sm text-gray-600">Key Topics</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={startChapterPractice}
                      className="flex-1 py-4 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Start AI Practice
                      </div>
                    </button>
                    <button
                      onClick={() => setShowChapterDetails(false)}
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Why AI Chapter Practice?</h3>
                <p className="text-gray-600">Experience targeted learning with intelligent question generation</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    🎯
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Focused Learning</h4>
                  <p className="text-gray-600 text-sm">Questions specifically generated for your chosen chapter</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    🧠
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Smart Adaptation</h4>
                  <p className="text-gray-600 text-sm">AI adjusts to your knowledge level within the chapter</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    📊
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Progress Tracking</h4>
                  <p className="text-gray-600 text-sm">Track your improvement in specific chapter topics</p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIPracticeChapters;


