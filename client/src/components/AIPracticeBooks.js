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

const subjectSessions = {
  'meteorology': [
    { slug: 'regular-march-2024', title: 'Regular March 2024', window: 'Regular Series', badge: 'Latest', questionCount: 45, duration: '120 mins', accent: 'from-[#6a11cb] to-[#2575fc]' },
    { slug: 'regular-december-attempt', title: 'Regular December Attempt', window: 'Regular Series', badge: 'High Yield', questionCount: 50, duration: '120 mins', accent: 'from-[#ff512f] to-[#dd2476]' },
    { slug: 'regular-sep-2023', title: 'Regular Sep 2023', window: 'Regular Series', badge: 'Archive', questionCount: 40, duration: '110 mins', accent: 'from-[#1d976c] to-[#93f9b9]' },
    { slug: 'regular-june-session', title: 'Regular June Session', window: 'Regular Series', badge: 'Archive', questionCount: 42, duration: '110 mins', accent: 'from-[#396afc] to-[#2948ff]' },
    { slug: 'regular-march-2025', title: 'Regular March 2025', window: 'Regular Series', badge: 'Upcoming', questionCount: 48, duration: '120 mins', accent: 'from-[#f7971e] to-[#ffd200]' },
    { slug: 'olode-may-2025', title: 'Olode May 2025', window: 'Olode Paper', badge: 'Upcoming', questionCount: 55, duration: '130 mins', accent: 'from-[#fc5c7d] to-[#6a82fb]' },
    { slug: 'olode-jan-2025', title: 'Olode Jan 2025', window: 'Olode Paper', badge: 'Archive', questionCount: 48, duration: '125 mins', accent: 'from-[#00c6ff] to-[#0072ff]' },
    { slug: 'olode-march-2025', title: 'Olode March 2025', window: 'Olode Paper', badge: 'Upcoming', questionCount: 52, duration: '125 mins', accent: 'from-[#7f00ff] to-[#e100ff]' },
    { slug: 'olode-question-nov-24', title: 'Olode Question Nov 24', window: 'Olode Paper', badge: 'Archive', questionCount: 47, duration: '120 mins', accent: 'from-[#f953c6] to-[#b91d73]' }
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
              {sessions.map((session, index) => (
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
                      <span>{session.questionCount} PYQs</span>
                      <span>⏱ {session.duration}</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                        {session.badge}
                      </span>
                    </div>
                  </div>

                  <div className="w-full md:w-auto">
                    <button
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition"
                      onClick={() => launchSession(session)}
                    >
                      Launch PYQ Session
                    </button>
                  </div>
                </Card>
              ))}

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


