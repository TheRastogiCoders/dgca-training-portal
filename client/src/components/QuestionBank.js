import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';

const QuestionBank = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

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
      totalQuestions: 2540,
      chapters: []
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

  const allBooks = [
    {
      id: 1,
      title: "CAE Oxford",
      description: "Comprehensive aviation knowledge & practice",
      icon: "📘",
      color: "from-blue-500 to-blue-600",
      slug: "cae-oxford"
    },
    {
      id: 2,
      title: "IC Joshi",
      description: "Advanced DGCA exam preparation",
      icon: "📖",
      color: "from-green-500 to-green-600",
      slug: "ic-joshi"
    }
  ];

  // Technical General specific books
  const technicalGeneralBooks = [
    {
      id: 1,
      title: "Principles of Flight",
      description: "ATPL Ground Training Series",
      icon: "🛫",
      color: "from-indigo-500 to-blue-600",
      slug: "principles-of-flight",
      totalQuestions: 720,
      difficulty: "Medium",
      chapters: [
        { id: 1, name: "Overview and Definitions", questions: 40, difficulty: "Easy" },
        { id: 2, name: "The Atmosphere", questions: 40, difficulty: "Easy" },
        { id: 3, name: "Basic Aerodynamic Theory", questions: 60, difficulty: "Medium" },
        { id: 4, name: "Subsonic Airflow", questions: 40, difficulty: "Medium" },
        { id: 5, name: "Lift", questions: 70, difficulty: "Medium" },
        { id: 6, name: "Drag", questions: 60, difficulty: "Medium" },
        { id: 7, name: "Stalling", questions: 50, difficulty: "Medium" },
        { id: 8, name: "High Lift Devices", questions: 50, difficulty: "Medium" },
        { id: 9, name: "Airframe Contamination", questions: 30, difficulty: "Easy" },
        { id: 10, name: "Stability and Control", questions: 60, difficulty: "Hard" },
        { id: 11, name: "Controls", questions: 40, difficulty: "Easy" },
        { id: 12, name: "Flight Mechanics", questions: 60, difficulty: "Hard" },
        { id: 13, name: "High Speed Flight", questions: 55, difficulty: "Hard" },
        { id: 14, name: "Limitations", questions: 40, difficulty: "Medium" },
        { id: 15, name: "Windshear", questions: 30, difficulty: "Medium" },
        { id: 16, name: "Propellers", questions: 35, difficulty: "Medium" },
        { id: 17, name: "Revision Questions", questions: 50, difficulty: "Medium" },
        { id: 18, name: "Index", questions: 0, difficulty: "Easy" }
      ]
    },
    {
      id: 2,
      title: "Airframes and Systems",
      description: "ATPL Ground Training Series",
      icon: "🛩️",
      color: "from-sky-500 to-cyan-600",
      slug: "airframes-and-systems",
      totalQuestions: 500,
      difficulty: "Medium",
      chapters: [
        { id: 1, name: "Fuselage, Wings and Stabilizing Surfaces", questions: 40, difficulty: "Medium" },
        { id: 2, name: "Basic Hydraulics", questions: 45, difficulty: "Medium" },
        { id: 3, name: "Landing Gear", questions: 40, difficulty: "Easy" },
        { id: 4, name: "Aircraft Wheels", questions: 25, difficulty: "Easy" },
        { id: 5, name: "Aircraft Tyres", questions: 25, difficulty: "Easy" },
        { id: 6, name: "Aircraft Brakes", questions: 35, difficulty: "Medium" },
        { id: 7, name: "Flight Control Systems", questions: 35, difficulty: "Medium" },
        { id: 8, name: "Flight Controls", questions: 35, difficulty: "Medium" },
        { id: 9, name: "Powered Flying Controls", questions: 40, difficulty: "Hard" },
        { id: 10, name: "Aircraft Pneumatic Systems", questions: 40, difficulty: "Medium" },
        { id: 11, name: "Pressurization Systems", questions: 35, difficulty: "Medium" },
        { id: 12, name: "Ice and Rain Protection", questions: 30, difficulty: "Medium" },
        { id: 13, name: "Aircraft Oxygen Equipment", questions: 30, difficulty: "Easy" },
        { id: 14, name: "Smoke Detection", questions: 20, difficulty: "Easy" },
        { id: 15, name: "Fire Detection and Protection", questions: 30, difficulty: "Medium" },
        { id: 16, name: "Aircraft Fuel Systems", questions: 40, difficulty: "Medium" },
        { id: 17, name: "Index", questions: 0, difficulty: "Easy" }
      ]
    },
    {
      id: 3,
      title: "Electrics and Electronics",
      description: "ATPL Ground Training Series",
      icon: "🔌",
      color: "from-teal-500 to-emerald-600",
      slug: "electrics-and-electronics",
      totalQuestions: 540,
      difficulty: "Medium",
      chapters: [
        { id: 1, name: "DC Electrics - Basic Principles", questions: 35, difficulty: "Easy" },
        { id: 2, name: "DC Electrics - Switches", questions: 25, difficulty: "Easy" },
        { id: 3, name: "DC Electrics - Circuit Protection and Capacitors", questions: 35, difficulty: "Medium" },
        { id: 4, name: "DC Electrics - Batteries", questions: 30, difficulty: "Easy" },
        { id: 5, name: "DC Electrics - Magnetism", questions: 30, difficulty: "Medium" },
        { id: 6, name: "DC Electrics - Generators and Alternators", questions: 35, difficulty: "Medium" },
        { id: 7, name: "DC Electrics - DC Motors", questions: 35, difficulty: "Medium" },
        { id: 8, name: "DC Electrics - Aircraft Electrical Power Systems", questions: 35, difficulty: "Medium" },
        { id: 9, name: "DC Electrics - Bonding and Screening", questions: 20, difficulty: "Easy" },
        { id: 10, name: "DC Electrics - Specimen Questions", questions: 20, difficulty: "Easy" },
        { id: 11, name: "AC Electrics - Introduction to AC", questions: 35, difficulty: "Medium" },
        { id: 12, name: "AC Electrics - Alternators", questions: 30, difficulty: "Medium" },
        { id: 13, name: "AC Electrics - Practical Aircraft Systems", questions: 35, difficulty: "Medium" },
        { id: 14, name: "AC Electrics - Transformers", questions: 25, difficulty: "Medium" },
        { id: 15, name: "AC Electrics - AC Motors", questions: 25, difficulty: "Medium" },
        { id: 16, name: "AC Electrics - Semiconductors", questions: 25, difficulty: "Medium" },
        { id: 17, name: "AC Electrics - Logic Gates", questions: 25, difficulty: "Medium" },
        { id: 18, name: "Index", questions: 0, difficulty: "Easy" }
      ]
    },
    {
      id: 4,
      title: "Powerplant",
      description: "ATPL Ground Training Series",
      icon: "🔥",
      color: "from-orange-500 to-amber-600",
      slug: "powerplant",
      totalQuestions: 780,
      difficulty: "Hard",
      chapters: [
        { id: 1, name: "Piston Engines - Introduction", questions: 25, difficulty: "Easy" },
        { id: 2, name: "Piston Engines - General", questions: 30, difficulty: "Easy" },
        { id: 3, name: "Piston Engines - Lubrication", questions: 30, difficulty: "Medium" },
        { id: 4, name: "Piston Engines - Cooling", questions: 30, difficulty: "Medium" },
        { id: 5, name: "Piston Engines - Ignition", questions: 35, difficulty: "Medium" },
        { id: 6, name: "Piston Engines - Fuel", questions: 30, difficulty: "Medium" },
        { id: 7, name: "Piston Engines - Mixture", questions: 25, difficulty: "Medium" },
        { id: 8, name: "Piston Engines - Carburettors", questions: 30, difficulty: "Medium" },
        { id: 9, name: "Piston Engines - Icing", questions: 25, difficulty: "Easy" },
        { id: 10, name: "Piston Engines - Fuel Injection", questions: 30, difficulty: "Medium" },
        { id: 11, name: "Piston Engines - Performance and Power Augmentation", questions: 35, difficulty: "Hard" },
        { id: 12, name: "Piston Engines - Propellers", questions: 35, difficulty: "Medium" },
        { id: 13, name: "Gas Turbines - Introduction", questions: 25, difficulty: "Easy" },
        { id: 14, name: "Gas Turbines - Air Inlets", questions: 25, difficulty: "Medium" },
        { id: 15, name: "Gas Turbines - Compressors", questions: 35, difficulty: "Hard" },
        { id: 16, name: "Gas Turbines - Combustion Chambers", questions: 35, difficulty: "Hard" },
        { id: 17, name: "Gas Turbines - The Turbine Assembly", questions: 35, difficulty: "Hard" },
        { id: 18, name: "Gas Turbines - The Exhaust System", questions: 25, difficulty: "Medium" },
        { id: 19, name: "Gas Turbines - Lubrication", questions: 25, difficulty: "Medium" },
        { id: 20, name: "Gas Turbines - Thrust", questions: 25, difficulty: "Medium" },
        { id: 21, name: "Gas Turbines - Reverse Thrust", questions: 20, difficulty: "Medium" },
        { id: 22, name: "Gas Turbines - Gearboxes and Accessory Drives", questions: 25, difficulty: "Medium" },
        { id: 23, name: "Gas Turbines - Ignition Systems", questions: 20, difficulty: "Easy" },
        { id: 24, name: "Gas Turbines - Auxiliary Power Units and Engine Starting", questions: 30, difficulty: "Medium" },
        { id: 25, name: "Gas Turbines - Fuels", questions: 25, difficulty: "Medium" },
        { id: 26, name: "Gas Turbines - Fuel Systems", questions: 30, difficulty: "Medium" },
        { id: 27, name: "Gas Turbines - Bleed Air", questions: 25, difficulty: "Medium" },
        { id: 28, name: "Revision Questions", questions: 40, difficulty: "Medium" },
        { id: 29, name: "Index", questions: 0, difficulty: "Easy" }
      ]
    }
  ];

  // Filter books based on selected subject
  const getAvailableBooks = (subject) => {
    if (subject && subject.title === "Meteorology") {
      // Show both books for Meteorology
      return allBooks;
    } else if (subject && subject.title === "Technical General") {
      // First step for Technical General: show only CAE Oxford
      return allBooks.filter(book => book.title === "CAE Oxford");
    } else {
      // Show only CAE Oxford for all other subjects
      return allBooks.filter(book => book.title === "CAE Oxford");
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setSelectedBook(null);
  };

  const handleBookClick = (book) => {
    // Always show chapters after selecting a book (no login required)
    setSelectedBook(book);
  };

  const handleChapterClick = (subject, chapter, book) => {
    const subjectSlug = subject.title.toLowerCase().replace(/\s+/g, '-');
    const chapterSlug = (chapter?.name || 'overview').toLowerCase().replace(/\s+/g, '-');
    navigate(`/practice/${subjectSlug}/${book.slug}/${chapterSlug}`);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedBook(null);
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
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
        <main className="flex-1 p-8 pt-20 md:pt-24 pb-20 md:pb-8 md:ml-24">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Question Bank
              </h1>
              <p className="text-xl text-gray-900 mb-6">
                Practice questions organized by subject and chapter
              </p>
              {/* Open access: no login required banner for question bank */}
            </div>

            {/* Back Button */}
            {(selectedSubject || selectedBook) && (
              <div className="mb-6">
                <button
                  onClick={selectedBook ? handleBackToBooks : handleBackToSubjects}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {selectedBook ? 'Back to Books' : 'Back to Subjects'}
                </button>
              </div>
            )}

            {/* Subjects View */}
            {!selectedSubject && !selectedBook && (
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
                          <div className="flex items-center justify-center text-sm">
                            <span className="text-blue-600 font-semibold inline-flex items-center">
                              Start now
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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

            {/* Book Selection View */}
            {selectedSubject && !selectedBook && (
              <div>
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 bg-gradient-to-r ${selectedSubject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-4`}>
                    {selectedSubject.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedSubject.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedSubject.description}</p>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-300 rounded-full">
                    <span className="text-blue-800 font-medium text-sm">
                      📚 Choose your study material
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Select Your Book
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {getAvailableBooks(selectedSubject).map((book) => (
                      <Card 
                        key={book.id} 
                        className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                        onClick={() => handleBookClick(book)}
                      >
                        <div className="text-center">
                          <div className={`w-20 h-20 bg-gradient-to-r ${book.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            {book.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-gray-600 mb-6 text-base leading-relaxed">
                            {book.description}
                          </p>
                          <div className="flex items-center justify-center">
                            <div className={`flex items-center px-6 py-3 bg-gradient-to-r ${book.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform group-hover:scale-105`}>
                              <span className="mr-2">{book.icon}</span>
                              Select Book
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chapters/Sub-Books View */}
            {selectedSubject && selectedBook && (
              <div>
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 bg-gradient-to-r ${selectedSubject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-4`}>
                    {selectedSubject.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedSubject.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedSubject.description}</p>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${selectedBook.color} rounded-xl flex items-center justify-center text-white text-2xl mr-3`}>
                      {selectedBook.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-900">{selectedBook.title}</h3>
                      <p className="text-sm text-gray-600">{selectedBook.description}</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-300 rounded-full">
                    <span className="text-blue-800 font-medium text-sm">
                      📚 Practice information available
                    </span>
                  </div>
                </div>

                {selectedSubject.title === 'Technical General' && selectedBook.slug === 'cae-oxford' ? (
                  // For Technical General, after selecting CAE Oxford, show 4 Oxford sub-books
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {technicalGeneralBooks.map((book) => (
                      <Card
                        key={book.id}
                        className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                        onClick={() => setSelectedBook(book)}
                      >
                        <div className="text-center">
                          <div className={`w-20 h-20 bg-gradient-to-r ${book.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            {book.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-gray-600 mb-6 text-base leading-relaxed">
                            {book.description}
                          </p>
                          <div className="flex items-center justify-center">
                            <div className={`flex items-center px-6 py-3 bg-gradient-to-r ${book.color} text-white font-semibold rounded-lg`}>
                              <span className="mr-2">{book.icon}</span>
                              Select Book
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Default: show chapters for the selected book
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(selectedBook.chapters || selectedSubject.chapters || []).map((chapter) => (
                      <Card key={chapter.id} className="p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{chapter.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Chapter overview
                              </span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(chapter.difficulty)}`}>
                            {chapter.difficulty}
                          </span>
                        </div>

                        <div className="flex justify-center">
                          <button
                            onClick={() => handleChapterClick(selectedSubject, chapter, selectedBook)}
                            className={`w-full py-3 px-6 bg-gradient-to-r ${selectedBook.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                            title={`Practice with ${selectedBook.title}`}
                          >
                            <div className="flex items-center justify-center">
                              <span className="mr-2">{selectedBook.icon}</span>
                              Start Practice
                            </div>
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuestionBank;
