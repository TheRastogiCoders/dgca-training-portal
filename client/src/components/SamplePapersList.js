import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import { samplePapersData } from '../data/samplePapers';

const subjectData = {
  'air-regulations': {
    title: 'Air Regulations',
    icon: '📋',
    description: 'Civil Aviation Rules & Regulations',
    color: 'from-blue-500 to-blue-600'
  },
  'air-navigation': {
    title: 'Air Navigation',
    icon: '🧭',
    description: 'Navigation Systems & Procedures',
    color: 'from-green-500 to-green-600'
  },
  'meteorology': {
    title: 'Meteorology',
    icon: '🌤️',
    description: 'Weather Systems & Aviation Weather',
    color: 'from-yellow-500 to-orange-500'
  },
  'technical-general': {
    title: 'Technical General',
    icon: '⚙️',
    description: 'Aircraft Systems & General Knowledge',
    color: 'from-red-500 to-red-600'
  },
  'technical-specific': {
    title: 'Technical Specific',
    icon: '✈️',
    description: 'Aircraft Type Specific Knowledge',
    color: 'from-purple-500 to-purple-600'
  },
  'radio-telephony': {
    title: 'Radio Telephony (RTR)-A',
    icon: '🎧',
    description: 'Radio Communication Procedures',
    color: 'from-cyan-500 to-cyan-600'
  }
};

const bookData = {
  'rk-bali': {
    title: 'RK Bali',
    icon: '📗',
    description: 'CPL/ATPL Ground Training Series',
    color: 'from-emerald-500 to-green-600'
  },
  'ic-joshi': {
    title: 'IC Joshi',
    icon: '📖',
    description: 'CPL/ATPL Ground Training Series',
    color: 'from-indigo-500 to-purple-600'
  },
  'oxford': {
    title: 'CAE Oxford',
    icon: '📘',
    description: 'CPL/ATPL Ground Training Series',
    color: 'from-blue-500 to-blue-600'
  },
  'cae-oxford': {
    title: 'CAE Oxford',
    icon: '📘',
    description: 'CPL/ATPL Ground Training Series',
    color: 'from-blue-500 to-blue-600'
  }
};

const SamplePapersList = () => {
  const { subjectSlug, bookSlug } = useParams();
  const navigate = useNavigate();

  const subject = subjectData[subjectSlug] || {
    title: 'Unknown Subject',
    icon: '📚',
    description: '',
    color: 'from-gray-500 to-gray-600'
  };

  const book = bookData[bookSlug] || {
    title: 'Unknown Book',
    icon: '📖',
    description: 'CPL/ATPL Ground Training Series',
    color: 'from-blue-500 to-blue-600'
  };

  const samplePapers = [
    { id: 1, name: 'Sample Paper 1', key: 'Sample Paper 1' },
    { id: 2, name: 'Sample Paper 2', key: 'Sample Paper 2' },
    { id: 3, name: 'Sample Paper 3', key: 'Sample Paper 3' },
    { id: 4, name: 'Sample Paper 4', key: 'Sample Paper 4' },
    { id: 5, name: 'Sample Paper 5', key: 'Sample Paper 5' }
  ];

  const handleSamplePaperClick = (paperKey) => {
    navigate(`/sample-papers/${subjectSlug}/${bookSlug}/${paperKey.replace(/\s+/g, '-').toLowerCase()}`);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <SiteSidebar />
      <div className="flex">
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <button 
                onClick={() => navigate(`/questions/${subjectSlug}/${bookSlug}`)}
                className="text-blue-600 hover:underline inline-flex items-center cursor-pointer bg-transparent border-none p-0"
              >
                <span className="mr-1">←</span> Back to Chapters
              </button>
            </div>
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 bg-gradient-to-r ${subject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-4`}>
                {subject.icon}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{subject.title}</h2>
              <p className="text-gray-600 mb-4">{subject.description}</p>
              <div className="flex items-center justify-center mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${book.color} rounded-xl flex items-center justify-center text-white text-2xl mr-3`}>
                  {book.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600">{book.description}</p>
                </div>
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-300 rounded-full">
                <span className="text-blue-800 font-medium text-sm">
                  📚 Sample Question Papers
                </span>
              </div>
            </div>

            {/* Sample Papers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {samplePapers.map((paper) => {
                const paperData = samplePapersData[paper.key];
                const questionCount = paperData?.Questions?.length || 0;
                const isAvailable = questionCount > 0;
                
                return (
                  <Card 
                    key={paper.id} 
                    className={`p-6 hover:shadow-lg transition-all duration-300 ${!isAvailable ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{paper.name}</h3>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            {isAvailable ? `${questionCount} questions` : 'Coming soon'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      {isAvailable ? (
                        <button
                          onClick={() => handleSamplePaperClick(paper.key)}
                          className={`w-full py-3 px-6 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform bg-gradient-to-r ${book.color} text-white hover:shadow-lg hover:scale-[1.02] focus:ring-blue-500`}
                          title={`View ${paper.name}`}
                        >
                          <div className="flex items-center justify-center">
                            <span className="mr-2">📄</span>
                            Start Practice
                          </div>
                        </button>
                      ) : (
                        <div className="w-full py-3 px-6 bg-gray-100 text-gray-500 rounded-lg text-center">
                          <p className="text-xs text-gray-400 mt-1">
                            This sample paper is not available yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SamplePapersList;

