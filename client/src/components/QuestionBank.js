import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';

const QuestionBank = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);

  const subjects = [
    {
      id: 1,
      title: "Air Regulations",
      icon: "📋",
      description: "Civil Aviation Rules & Regulations",
      color: "from-blue-500 to-blue-600",
      totalQuestions: 1250,
      chapters: [
        { id: 1, name: "Civil Aviation Rules", questions: 320, difficulty: "Medium" },
        { id: 2, name: "Air Traffic Control", questions: 280, difficulty: "Hard" },
        { id: 3, name: "Flight Operations", questions: 250, difficulty: "Medium" },
        { id: 4, name: "Aircraft Registration", questions: 200, difficulty: "Easy" },
        { id: 5, name: "Licensing & Certification", questions: 200, difficulty: "Medium" }
      ]
    },
    {
      id: 2,
      title: "Air Navigation",
      icon: "🧭",
      description: "Navigation Systems & Procedures",
      color: "from-green-500 to-green-600",
      totalQuestions: 980,
      chapters: [
        { id: 1, name: "Dead Reckoning", questions: 180, difficulty: "Medium" },
        { id: 2, name: "VOR/DME Navigation", questions: 220, difficulty: "Hard" },
        { id: 3, name: "GPS & RNAV", questions: 200, difficulty: "Medium" },
        { id: 4, name: "Flight Planning", questions: 190, difficulty: "Hard" },
        { id: 5, name: "Radio Navigation", questions: 190, difficulty: "Medium" }
      ]
    },
    {
      id: 3,
      title: "Meteorology",
      icon: "🌤️",
      description: "Weather Systems & Aviation Weather",
      color: "from-yellow-500 to-orange-500",
      totalQuestions: 750,
      chapters: [
        { id: 1, name: "Atmosphere & Pressure", questions: 150, difficulty: "Easy" },
        { id: 2, name: "Cloud Types & Formation", questions: 180, difficulty: "Medium" },
        { id: 3, name: "Weather Fronts", questions: 160, difficulty: "Medium" },
        { id: 4, name: "Wind Systems", questions: 140, difficulty: "Easy" },
        { id: 5, name: "Weather Hazards", questions: 120, difficulty: "Hard" }
      ]
    },
    {
      id: 4,
      title: "Technical General",
      icon: "⚙️",
      description: "Aircraft Systems & General Knowledge",
      color: "from-red-500 to-red-600",
      totalQuestions: 1100,
      chapters: [
        { id: 1, name: "Aircraft Engines", questions: 280, difficulty: "Hard" },
        { id: 2, name: "Electrical Systems", questions: 220, difficulty: "Medium" },
        { id: 3, name: "Hydraulic Systems", questions: 200, difficulty: "Medium" },
        { id: 4, name: "Aerodynamics", questions: 200, difficulty: "Hard" },
        { id: 5, name: "Aircraft Structures", questions: 200, difficulty: "Medium" }
      ]
    },
    {
      id: 5,
      title: "Technical Specific",
      icon: "✈️",
      description: "Aircraft Type Specific Knowledge",
      color: "from-purple-500 to-purple-600",
      totalQuestions: 850,
      chapters: [
        { id: 1, name: "Cessna 172 Systems", questions: 200, difficulty: "Medium" },
        { id: 2, name: "Piper Cherokee", questions: 180, difficulty: "Medium" },
        { id: 3, name: "Multi-Engine Aircraft", questions: 220, difficulty: "Hard" },
        { id: 4, name: "Turboprop Systems", questions: 150, difficulty: "Hard" },
        { id: 5, name: "Jet Aircraft Basics", questions: 100, difficulty: "Hard" }
      ]
    },
    {
      id: 6,
      title: "Radio Telephony (RTR)-A",
      icon: "📻",
      description: "Radio Communication Procedures",
      color: "from-cyan-500 to-cyan-600",
      totalQuestions: 650,
      chapters: [
        { id: 1, name: "Standard Phraseology", questions: 150, difficulty: "Easy" },
        { id: 2, name: "ATC Communications", questions: 180, difficulty: "Medium" },
        { id: 3, name: "Emergency Procedures", questions: 120, difficulty: "Medium" },
        { id: 4, name: "Radio Equipment", questions: 100, difficulty: "Easy" },
        { id: 5, name: "International Procedures", questions: 100, difficulty: "Hard" }
      ]
    }
  ];

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
  };

  const handleChapterClick = (subject, chapter) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Navigate to practice test with subject and chapter
    navigate(`/practice-test/ai/${subject.title.toLowerCase().replace(/\s+/g, '-')}/${chapter.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 pt-20 md:pt-8 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Question Bank
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Practice questions organized by subject and chapter
              </p>
              {!isAuthenticated && (
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-full mb-4">
                  <span className="text-yellow-800 font-medium text-sm">🔒 Login required to access questions</span>
                </div>
              )}
            </div>

            {/* Back Button */}
            {selectedSubject && (
              <div className="mb-6">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Subjects
                </button>
              </div>
            )}

            {/* Subjects View */}
            {!selectedSubject && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Choose Your Subject
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                      <Card 
                        key={subject.id} 
                        className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                        onClick={() => handleSubjectClick(subject)}
                      >
                        <div className="text-center">
                          <div className={`w-16 h-16 bg-gradient-to-r ${subject.color} rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            {subject.icon}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {subject.title}
                          </h3>
                          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                            {subject.description}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              {subject.totalQuestions.toLocaleString()} Questions
                            </span>
                            <span className="text-blue-600 font-medium">
                              {subject.chapters.length} Chapters
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Question Bank Overview</h3>
                    <p className="text-gray-600">Comprehensive coverage of all DGCA subjects</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">5,580</div>
                      <div className="text-gray-600">Total Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">6</div>
                      <div className="text-gray-600">Subjects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">30</div>
                      <div className="text-gray-600">Chapters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
                      <div className="text-gray-600">DGCA Aligned</div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Chapters View */}
            {selectedSubject && (
              <div>
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 bg-gradient-to-r ${selectedSubject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-4`}>
                    {selectedSubject.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedSubject.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedSubject.description}</p>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-300 rounded-full">
                    <span className="text-blue-800 font-medium text-sm">
                      📚 {selectedSubject.totalQuestions.toLocaleString()} Questions • {selectedSubject.chapters.length} Chapters
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedSubject.chapters.map((chapter) => (
                    <Card key={chapter.id} className="p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{chapter.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              {chapter.questions} Questions
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(chapter.difficulty)}`}>
                          {chapter.difficulty}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleChapterClick(selectedSubject, chapter)}
                        className={`w-full py-3 px-4 bg-gradient-to-r ${selectedSubject.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      >
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Start Practice
                        </div>
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuestionBank;
