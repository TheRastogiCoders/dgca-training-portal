import React, { useState, useEffect, useRef } from 'react';
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
    features: ['Latest DGCA amendments', 'Pattern insights', 'Time-tracking analytics']
  },
  { 
    slug: 'air-navigation', 
    name: 'Air Navigation', 
    icon: '🧭', 
    color: 'from-green-500 to-green-600',
    description: 'Navigation Systems & Procedures',
    questions: 'Unlimited',
    difficulty: 'Adaptive',
    features: ['Mixed plotting drills', 'Weak-topic callouts', 'Speed vs accuracy meters']
  },
  { 
    slug: 'meteorology', 
    name: 'Meteorology', 
    icon: '🌤️', 
    color: 'from-yellow-500 to-orange-500',
    description: 'Weather Systems & Aviation Weather',
    questions: 'Unlimited',
    difficulty: 'Adaptive',
    features: ['Live MET data cues', 'Concept refresh cards', 'Visual storm timelines']
  },
  { 
    slug: 'technical-general', 
    name: 'Technical General', 
    icon: '⚙️', 
    color: 'from-red-500 to-red-600',
    description: 'Aircraft Systems & General Knowledge',
    questions: 'Unlimited',
    difficulty: 'Adaptive',
    features: ['System schematics', 'Formula quick-notes', 'Checks & limitations']
  },
  { 
    slug: 'technical-specific', 
    name: 'Technical Specific', 
    icon: '✈️', 
    color: 'from-purple-500 to-purple-600',
    description: 'Aircraft Type Specific Knowledge',
    questions: 'Unlimited',
    difficulty: 'Adaptive',
    features: ['Type-rating trivia', 'Procedural pitfalls', 'Expert tips']
  },
  { 
    slug: 'radio-telephony', 
    name: 'Radio Telephony (RTR)-A', 
    icon: '🎧', 
    color: 'from-cyan-500 to-cyan-600',
    description: 'Radio Communication Procedures',
    questions: 'Unlimited',
    difficulty: 'Adaptive',
    features: ['Phraseology drills', 'Emergency prompts', 'Scenario-based feedback']
  },
];

const heroStats = [
  { label: 'DGCA Papers', value: '120+', detail: '2018–2025 curated PYQs' },
  { label: 'Smart Reviews', value: '4.9★', detail: 'Instant analytics & tips' },
  { label: 'Adaptive Sets', value: '∞', detail: 'Personalized every launch' }
];

const flowTimeline = [
  { tag: '01', title: 'Select Subject', detail: 'Lock onto the paper you’re targeting this week.' },
  { tag: '02', title: 'Tune Session', detail: 'Pick the mood: deep revision, sprint, or mock mode.' },
  { tag: '03', title: 'Solve & Review', detail: 'DGCA-style timer, rich explanations, quick export.' }
];

const comingSoonSlugs = ['technical-specific', 'radio-telephony'];

const AIPracticeSubject = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [comingSoonSubject, setComingSoonSubject] = useState(null);
  const noticeTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  const handleSubjectClick = (subject, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (comingSoonSlugs.includes(subject.slug)) {
      setComingSoonSubject(subject.name);
      if (noticeTimeoutRef.current) {
        clearTimeout(noticeTimeoutRef.current);
      }
      noticeTimeoutRef.current = setTimeout(() => setComingSoonSubject(null), 3000);
      return;
    }

    navigate(`/pyq/ai/${subject.slug}`);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 pt-20 sm:pt-24 md:pt-24 pb-20 sm:pb-24 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72">
          <div className="max-w-6xl w-full mx-auto space-y-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2 text-sm">
              <Link 
                to="/pyq"
                className="inline-flex items-center text-blue-200 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to PYQs
              </Link>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/20">
                Step 2 · Choose Subject
              </span>
            </div>

          

            {/* Subject Selection */}
            <section className="space-y-6">
              {comingSoonSubject && (
                <div className="mx-auto max-w-3xl rounded-2xl border border-yellow-200 bg-yellow-50/90 px-4 py-3 text-center text-sm font-medium text-yellow-900 shadow">
                  {comingSoonSubject} PYQs are coming soon. Stay tuned!
                </div>
              )}
              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Step 2</p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">Choose Your Subject</h2>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                  Jump into the DGCA paper that matters right now. Adaptive streak tracking keeps every session fresh.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, index) => (
                  <Card 
                    key={subject.slug} 
                    className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 group animate-fade-in-up backdrop-blur border border-white/30 hover:ring-2 hover:ring-white/60 ${
                      comingSoonSlugs.includes(subject.slug) ? 'opacity-90' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.04}s` }}
                    onClick={() => handleSubjectClick(subject)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-90`} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]" />
                    <div className="relative flex flex-col h-full text-white space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl backdrop-blur group-hover:scale-110 transition-transform duration-300">
                            {subject.icon}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.35em] text-white/70">DGCA PYQ</p>
                            <h3 className="text-xl font-semibold leading-tight">{subject.name}</h3>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold uppercase px-3 py-1 rounded-full bg-white/15 border border-white/20 tracking-[0.2em]">
                          {comingSoonSlugs.includes(subject.slug) ? 'Soon' : 'Stack'}
                        </span>
                      </div>

                      <p className="text-sm text-white/80 flex-1">{subject.description}</p>

                      <button
                        className="mt-auto w-full py-3 px-4 bg-white text-gray-900 font-semibold rounded-2xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
                        onClick={(event) => handleSubjectClick(subject, event)}
                      >
                        Launch Adaptive PYQs
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Back to Practice */}
            <div className="text-center">
              <Link 
                to="/pyq"
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


