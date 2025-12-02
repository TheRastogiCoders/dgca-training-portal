import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';

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
    icon: '🎧',
    color: 'from-cyan-500 to-cyan-600',
    description: 'Radio Communication Procedures',
    topics: ['Standard Phraseology', 'ATC Communications', 'Emergency Procedures', 'Radio Equipment', 'International Procedures']
  }
};

// Sessions that have actual question data available
// Only include sessions that have corresponding JSON files
const availableSessions = {
  'meteorology': [
    'regular-march-2024',
    'regular-december-attempt',
    'regular-sep-2023',
    'olode-session-07-2025',
    'regular-june-session',
    'regular-march-2025',
    'olode-may-2025',
    'olode-nov-2024'
  ],
  'air-regulations': [
    'olode-may-2025',
    'regular-session-01-2025',
    'olode-session-2-2025',
    'january-ondemand-2025',
    'olode-05-2025',
    'olode-april-session-regulation',
    'regulations-june-2025'
  ],
  'air-navigation': [
    'nav-olode-session1-jan-2025',
    'nav-regular-march-2025',
    'nav-regular-june-exam',
    'nav-olode-session3-2025',
    'nav-regular-december-2024'
  ],
  'technical-general': []  // No sessions are available yet
};

const subjectSessions = {
  'meteorology': [
    { slug: 'regular-march-2024', title: 'Regular March 2024', window: 'Regular Series', badge: 'Latest', questionCount: 45, accent: 'from-[#6a11cb] to-[#2575fc]' },
    { slug: 'regular-december-attempt', title: 'Regular December Attempt', window: 'Regular Series', badge: 'High Yield', questionCount: 50, accent: 'from-[#ff512f] to-[#dd2476]' },
    { slug: 'regular-sep-2023', title: 'Regular Sep 2023', window: 'Regular Series', badge: 'Archive', questionCount: 40, accent: 'from-[#1d976c] to-[#93f9b9]' },
    { slug: 'regular-june-session', title: 'Regular June Session', window: 'Regular Series', badge: 'Available', questionCount: 42, accent: 'from-[#396afc] to-[#2948ff]' },
    { slug: 'regular-march-2025', title: 'METEOROLOGY Regular session 01 of 2025', window: 'Regular Series', badge: 'Latest', questionCount: 39, accent: 'from-[#f7971e] to-[#ffd200]' },
    { slug: 'olode-may-2025', title: 'Met OLODE 4TH session May 2025', window: 'Olode Paper', badge: 'Latest', questionCount: 52, accent: 'from-[#fc5c7d] to-[#6a82fb]' },
    { slug: 'olode-session-07-2025', title: 'OLODE Session 07 2025 (31st Oct, 2025)', window: 'Olode Paper', badge: 'Latest', questionCount: 38, accent: 'from-[#f5af19] to-[#f12711]' },
    { slug: 'olode-jan-2025', title: 'Olode Jan 2025', window: 'Olode Paper', badge: 'Coming Soon', questionCount: 48, accent: 'from-[#00c6ff] to-[#0072ff]' },
    { slug: 'olode-march-2025', title: 'Olode March 2025', window: 'Olode Paper', badge: 'Coming Soon', questionCount: 52, accent: 'from-[#7f00ff] to-[#e100ff]' },
    { slug: 'olode-nov-2024', title: 'Previous met olode question nov 24', window: 'Olode Paper', badge: 'Available', questionCount: 34, accent: 'from-[#f953c6] to-[#b91d73]' }
  ],
  'air-regulations': [
    { slug: 'olode-may-2025', title: 'REG- OLODE MAY SESSION 2025', window: 'Olode Paper', badge: 'Available', questionCount: 50, accent: 'from-[#fc5c7d] to-[#6a82fb]' },
    { slug: 'regular-session-01-2025', title: 'REG- REGULAR SESSION 01 2025', window: 'Regular Series', badge: 'Latest', questionCount: 29, accent: 'from-[#1d976c] to-[#93f9b9]' },
    { slug: 'olode-session-2-2025', title: 'Regulations olode session 2 2025', window: 'Olode Paper', badge: 'Available', questionCount: 29, accent: 'from-[#6a11cb] to-[#2575fc]' },
    { slug: 'january-ondemand-2025', title: 'JANUARY ON-DEMAND 2025', window: 'Regular Series', badge: 'Available', questionCount: 43, accent: 'from-[#396afc] to-[#2948ff]' },
    { slug: 'olode-05-2025', title: 'Regulations OLODE 05 2025', window: 'Olode Paper', badge: 'Available', questionCount: 11, accent: 'from-[#00c6ff] to-[#0072ff]' },
    { slug: 'olode-april-session-regulation', title: 'OLODE APRIL SESSION REGULATION', window: 'Olode Paper', badge: 'Available', questionCount: 10, accent: 'from-[#f953c6] to-[#b91d73]' },
    { slug: 'regulations-june-2025', title: 'REGULATIONS JUNE 2025', window: 'Regular Series', badge: 'Available', questionCount: 27, accent: 'from-[#00b4d8] to-[#0077b6]' }
  ],
  'air-navigation': [
    { 
      slug: 'nav-olode-session1-jan-2025', 
      title: 'NAV- OLODE SESSION1 JAN 2025', 
      window: 'OLODE Paper', 
      badge: 'Available', 
      questionCount: 20, 
      accent: 'from-[#6a11cb] to-[#2575fc]',
      disabled: false
    },
    { 
      slug: 'nav-regular-march-2025', 
      title: 'NAV- REGULAR MARCH 2025', 
      window: 'Regular Series', 
      badge: 'Latest', 
      questionCount: 38, 
      accent: 'from-[#1d976c] to-[#93f9b9]',
      disabled: false
    },
    { 
      slug: 'nav-regular-june-exam', 
      title: 'NAV- REGULAR JUNE EXAM', 
      window: 'Regular Series', 
      badge: 'Available', 
      questionCount: 24, 
      accent: 'from-[#f7971e] to-[#ffd200]',
      disabled: false
    },
    { 
      slug: 'nav-olode-session3-2025', 
      title: 'NAV- OLODE SESSION3 2025', 
      window: 'OLODE Paper', 
      badge: 'Available', 
      questionCount: 20, 
      accent: 'from-[#fc5c7d] to-[#6a82fb]',
      disabled: false
    },
    { 
      slug: 'nav-regular-december-2024', 
      title: 'NAV- REGULAR DECEMBER 2024', 
      window: 'Regular Series', 
      badge: 'Available', 
      questionCount: 20, 
      accent: 'from-[#00b4d8] to-[#0077b6]',
      disabled: false
    }
  ],
  'technical-general': [
    { 
      slug: 'gen-olode-may-2025', 
      title: 'GEN-OLODE MAY 2025', 
      window: 'OLODE Paper', 
      badge: 'Coming Soon', 
      questionCount: 0, 
      accent: 'from-[#6a11cb] to-[#2575fc]',
      disabled: true
    },
    { 
      slug: 'gen-olode-jan-2025-session1', 
      title: 'GEN- OLODE JAN 2025 (SESSION1)', 
      window: 'OLODE Paper', 
      badge: 'Coming Soon', 
      questionCount: 0, 
      accent: 'from-[#1d976c] to-[#93f9b9]',
      disabled: true
    },
    { 
      slug: 'gen-regular-june-2025-session2', 
      title: 'GEN- REGULAR JUNE 2025 (SESSION2)', 
      window: 'Regular Series', 
      badge: 'Coming Soon', 
      questionCount: 0, 
      accent: 'from-[#f7971e] to-[#ffd200]',
      disabled: true
    },
    { 
      slug: 'gen-regular-march-2025', 
      title: 'GEN- REGULAR MARCH 2025', 
      window: 'Regular Series', 
      badge: 'Coming Soon', 
      questionCount: 0, 
      accent: 'from-[#fc5c7d] to-[#6a82fb]',
      disabled: true
    },
    { 
      slug: 'gen-regular-december-2024', 
      title: 'GEN- REGULAR DECEMBER 2024', 
      window: 'Regular Series', 
      badge: 'Coming Soon', 
      questionCount: 0, 
      accent: 'from-[#00b4d8] to-[#0077b6]',
      disabled: true
    },
    { 
      slug: 'gen-regular-march-2024', 
      title: 'GEN- REGULAR MARCH 2024', 
      window: 'Regular Series', 
      badge: 'Coming Soon', 
      questionCount: 0, 
      accent: 'from-[#7f00ff] to-[#e100ff]',
      disabled: true
    }
  ]
};

// Helper to create URL-friendly slugs from names
const slugify = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// Helper to extract year from session title
const extractYear = (title) => {
  // Match 4-digit years (e.g., 2024, 2025)
  const fourDigitMatch = title.match(/\b(20\d{2})\b/);
  if (fourDigitMatch) {
    return parseInt(fourDigitMatch[1], 10);
  }
  
  // Match 2-digit years (e.g., "Nov 24" -> 2024)
  const twoDigitMatch = title.match(/\b(\d{2})\b/);
  if (twoDigitMatch) {
    const year = parseInt(twoDigitMatch[1], 10);
    // Assume 20xx format (24 -> 2024, 25 -> 2025)
    return year < 50 ? 2000 + year : 1900 + year;
  }
  
  // Default to 0 if no year found (will be sorted last)
  return 0;
};

// Helper to sort sessions by year (descending)
const sortSessionsByYear = (sessions) => {
  return [...sessions].sort((a, b) => {
    const yearA = extractYear(a.title);
    const yearB = extractYear(b.title);
    return yearB - yearA; // Descending order (newest first)
  });
};

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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const subject = subjectData[subjectSlug] || {
    name: 'Unknown Subject',
    icon: '📚',
    color: 'from-gray-500 to-gray-600',
    description: 'Aviation subject',
    topics: []
  };

  const sessions = sortSessionsByYear(subjectSessions[subjectSlug] || []);
  const defaultBookSlug = 'ic-joshi';
  const practiceSettings = {
    questionCount: 10,
    difficulty: 'adaptive',
    timeLimit: 'unlimited',
    showExplanations: true
  };

  const ensureAuth = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const launchSession = (session) => {
    if (!ensureAuth()) return;
    // Check if session has available data
    const isAvailable = availableSessions[subjectSlug]?.includes(session.slug);
    if (!isAvailable) {
      return; // Don't launch if session is not available
    }
    const chapterSlug = defaultChapterBySubject[subjectSlug] || 'chapter-1';
    navigate(`/pyq/ai/${subjectSlug}/${defaultBookSlug}/${chapterSlug}`, {
      state: { practiceSettings, session }
    });
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        <SiteSidebar />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between text-sm">
              <Link 
                to="/pyq/ai"
                className="inline-flex items-center text-blue-200 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Subjects
              </Link>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/20">
                PYQ Sessions
              </span>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs uppercase tracking-[0.4em]">
                DGCA PYQ
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow">
                {subject.name} Session List
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-3xl">
                {subject.description}. Pick one of the curated DGCA windows below and jump straight into its PYQ mix.
              </p>
            </div>

            <section className="space-y-4">
              {sessions.map((session, index) => {
                const isAvailable = availableSessions[subjectSlug]?.includes(session.slug);
                return (
                  <Card 
                    key={session.slug} 
                    className="p-5 sm:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold bg-gradient-to-br ${session.accent}`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-xs uppercase text-gray-400 tracking-[0.3em]">{session.window}</p>
                          <h2 className="text-xl font-semibold text-gray-900">{session.title}</h2>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        {isAvailable ? (
                          <>
                            <span className="text-sm text-gray-500">{session.questionCount} Questions</span>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Questions coming soon</span>
                        )}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          session.badge === 'Coming Soon' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {session.badge}
                        </span>
                      </div>
                    </div>

                    <div className="w-full md:w-auto">
                      <button
                        className={`w-full px-4 py-3 rounded-xl font-semibold transition ${
                          isAvailable
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => launchSession(session)}
                        disabled={!isAvailable}
                      >
                        {isAvailable ? 'Launch PYQ Session' : 'Coming Soon'}
                      </button>
                    </div>
                  </Card>
                );
              })}

              {!sessions.length && (
                <Card className="p-6 text-center text-gray-500">
                  No session data available for this subject yet.
                </Card>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIPracticeBooks;


