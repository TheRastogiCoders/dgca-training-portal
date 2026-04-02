import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';
import GLOBAL_ASSETS from '../config/globalAssets';
import { IconClipboard, IconLibrary, IconBook, IconCheck, IconChart } from './ui/Icons';

const HERO_AUTOPLAY_MS = 5500;

const HomePage = () => (
  <>
    <SEO
      title="Vimaanna - wings within reach!"
      description="Best DGCA exam preparation platform for pilot license exams (CPL, ATPL). Practice tests, PYQ sessions, question banks for Air Regulations, Meteorology, Air Navigation, Technical General. Aviation exam preparation, pilot exam questions, and study materials. Prepare for commercial pilot license and airline transport license exams."
      keywords="DGCA exam, DGCA preparation, DGCA practice test, DGCA question bank, DGCA study material, Air Regulations DGCA, Meteorology DGCA, Air Navigation DGCA, Technical General DGCA, DGCA pilot exam, DGCA CPL exam, DGCA ATPL exam, aviation exam preparation, pilot license exam, DGCA training, CPL exam, ATPL exam, commercial pilot license, airline transport pilot license, aviation training, pilot training"
    />
    <div className="min-h-screen gradient-bg overflow-x-hidden">
      <main className="page-content">
        <HeroCarousel />
        <div className="page-content-inner home-body-content">
          <FeaturesStrip />
          <AboutSection />
          <LibrarySection />
          <SubjectsStrip />
          <StatsStrip />
          <FAQSection />
          <FinalCTA />
          <FeedbackSection />
        </div>
      </main>
    </div>
  </>
);

export default HomePage;

function HeroCarousel() {
  const slides = GLOBAL_ASSETS.HERO_CAROUSEL_SLIDES || [
    { image: GLOBAL_ASSETS.HERO_BG, title: 'Wings Within Reach', tagline: 'Your one place for DGCA exam prep.' },
  ];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i) => {
    setIndex((i + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, HERO_AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  return (
    <section
      className="hero-carousel-wrapper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        className="hero-carousel-track"
        style={{
          width: `${slides.length * 100}%`,
          transform: `translateX(-${index * (100 / slides.length)}%)`,
        }}
        role="list"
        aria-label="Hero carousel"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="hero-carousel-slide hero-section-wrapper hero-redesign hero-has-bg"
            style={{
              flex: `0 0 ${100 / slides.length}%`,
              width: `${100 / slides.length}%`,
              backgroundImage: `url(${slide.image})`,
            }}
            role="listitem"
            aria-hidden={i !== index}
          >
            <div className="hero-section-inner hero-redesign-inner">
              <div className="hero-status-pill hero-redesign-pill">
                <span className="hero-status-pill-dot" aria-hidden />
                <span>Open for all students</span>
              </div>
              <div className="hero-redesign-badge">DGCA · CPL & ATPL</div>
              <h1 className="hero-redesign-title">{slide.title}</h1>
              <p className="hero-redesign-tagline">{slide.tagline}</p>
              <div className="hero-redesign-cta">
                <Link to="/question-bank" className="btn-institute-primary hero-redesign-btn-primary inline-flex items-center gap-2">
                  Start Practicing
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <div className="hero-redesign-quick-links">
                  <Link to="/question-bank" className="hero-quick-link">Question Bank</Link>
                  <span className="hero-quick-sep" aria-hidden>·</span>
                  <Link to="/pyq" className="hero-quick-link">PYQ</Link>
                  <span className="hero-quick-sep" aria-hidden>·</span>
                  <Link to="/library" className="hero-quick-link">Library</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="hero-carousel-dots" role="tablist" aria-label="Carousel slides">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              className={`hero-carousel-dot ${i === index ? 'active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FeaturesStrip() {
  const items = [
    { label: 'Open to start', caption: 'Access core question bank and library without paying anything.', Icon: IconLibrary },
    { label: 'Built for DGCA exams', caption: 'Content aligned with CPL & ATPL theory syllabus, not generic aviation.', Icon: IconCheck },
    { label: 'Practice like the real paper', caption: 'Timed tests, PYQ, and chapter-wise drills that feel like exam day.', Icon: IconClipboard },
    { label: 'See where you stand', caption: 'Simple dashboards to understand strong and weak areas over time.', Icon: IconChart },
  ];
  return (
    <section className="mb-16 md:mb-20">
      <div className="site-card p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 mb-3 text-center md:text-left">
          Why pilots study with VIMAANNA
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-700 w-10 h-10" aria-hidden>
                  {item.Icon && <item.Icon className="w-5 h-5" size="md" />}
                </span>
                <span className="text-slate-900 font-semibold text-sm md:text-base">{item.label}</span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed pl-12 md:pl-0">
                {item.caption}
              </p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

function SubjectsStrip() {
  const subjects = [
    { name: 'Air Regulations', to: '/question-bank', tag: 'CPL & ATPL' },
    { name: 'Meteorology', to: '/question-bank', tag: 'Weather & performance' },
    { name: 'Air Navigation', to: '/question-bank', tag: 'Route planning' },
    { name: 'Technical General', to: '/question-bank', tag: 'Aircraft systems' },
    { name: 'Radio Telephony', to: '/question-bank', tag: 'RTR (A)' },
  ];
  return (
    <section className="mb-16 md:mb-20">
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-2xl px-5 py-7 md:px-8 md:py-9">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">All DGCA theory subjects</h2>
            <p className="text-slate-600 text-sm md:text-base max-w-xl">
              Move between subjects without switching platforms. VIMAANNA keeps your entire CPL & ATPL prep in one place.
            </p>
          </div>
          <Link
            to="/question-bank"
            className="btn-institute-primary inline-flex items-center justify-center gap-2 w-full md:w-auto"
          >
            Browse Question Bank
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {subjects.map((s, i) => (
            <Link
              key={i}
              to={s.to}
              className="group flex flex-col justify-between rounded-xl bg-white/90 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/80 px-4 py-3 shadow-sm transition-colors"
            >
              <span className="font-semibold text-slate-900 text-sm md:text-base mb-1 group-hover:text-blue-700">
                {s.name}
              </span>
              <span className="text-[11px] md:text-xs text-slate-500">
                {s.tag}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  const stats = [
    { value: 'Always open', label: 'Core practice tools' },
    { value: '6+', label: 'Key DGCA subjects' },
    { value: 'Exam-style', label: 'Question patterns' },
    { value: '24/7', label: 'Any device, anywhere' },
  ];
  return (
    <section className="mb-16 md:mb-20">
      <div className="site-card p-6 md:p-8">
        <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-5">Built for serious DGCA aspirants</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {stats.map((item, i) => (
            <div key={i} className="text-left py-3 px-2 rounded-2xl">
              <div className="text-xl md:text-2xl font-bold text-blue-700 mb-1">{item.value}</div>
              <div className="text-slate-600 text-xs md:text-sm font-medium">{item.label}</div>
            </div>
        ))}
      </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: 'What is DGCA and who is this for?',
    a: 'DGCA (Directorate General of Civil Aviation) regulates civil aviation in India. This platform is for aspiring pilots preparing for CPL (Commercial Pilot Licence) and ATPL (Airline Transport Pilot Licence) theory exams.',
  },
  {
    q: 'Is VIMAANNA open to everyone?',
    a: 'Yes. We provide question banks, previous year questions (PYQ), and study library access. Our mission is to make quality DGCA preparation accessible to every student.',
  },
  {
    q: 'Which subjects are covered?',
    a: 'We cover Air Regulations, Air Navigation, Meteorology, Technical General, Technical Specific, and Radio Telephony (RTR-A), aligned with the DGCA syllabus and popular books like CAE Oxford, RK Bali, and IC Joshi.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'You can browse and use the Question Bank and Library without an account. Log in or sign up to save your progress, view results, and track performance on your profile.',
  },
  {
    q: 'How do I get help or report an issue?',
    a: 'Email us at contactvimaanna@gmail.com or use the Feedback section on this page. We typically respond within 24 hours.',
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section className="mb-16 md:mb-20">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">Frequently asked questions</h2>
      <p className="text-slate-600 text-center max-w-xl mx-auto mb-10">Quick answers about VIMAANNA and DGCA preparation.</p>
      <div className="max-w-2xl mx-auto space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-slate-900 font-medium hover:bg-slate-50 transition-colors"
            >
              <span>{item.q}</span>
              <span className="flex-shrink-0 text-xl leading-none text-blue-600">{openIndex === i ? '−' : '+'}</span>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="vimaanna-cta-block mb-16 md:mb-20">
      <h2 className="vimaanna-cta-title text-2xl md:text-3xl">Ready to start?</h2>
      <p className="vimaanna-cta-desc">
        Join thousands of aspiring pilots preparing for DGCA exams. Question bank, PYQ, and library - all in one place.
      </p>
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        <Link to="/question-bank" className="btn-cta-primary inline-flex items-center gap-2 px-6 py-3">
          Get Started
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <Link to="/login" className="btn-cta-secondary px-6 py-3">
          Log in
        </Link>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about-preview" className="mb-16 md:mb-20 scroll-mt-24">
      <div className="site-card p-8 md:p-12 flex flex-col lg:flex-row gap-10 lg:items-center">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 mb-3">Who we are</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">About VIMAANNA</h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4 max-w-2xl">
            VIMAANNA is a focused DGCA preparation platform for aspiring commercial and airline transport pilots. We blend structured question banks, PYQs, and a clean interface so you can focus on learning - not figuring out the tool.
          </p>
          <ul className="space-y-2 text-sm text-slate-600 mb-6">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Designed around the real DGCA syllabus for CPL & ATPL theory exams.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Built by pilots and instructors who know the exam pattern first-hand.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Lightweight, distraction-light interface that works well even on slower connections.</span>
            </li>
          </ul>
          <Link to="/about" className="btn-institute-primary inline-flex items-center gap-2">
            Learn more
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 md:gap-5">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex flex-col justify-between min-h-[130px]">
              <div className="text-xs font-semibold text-blue-700 mb-1">For CPL & ATPL</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">DGCA focus</div>
              <p className="text-[11px] text-slate-600">No generic question sets - only aviation theory that matters.</p>
            </div>
            <div className="rounded-2xl bg-slate-900 text-white p-4 flex flex-col justify-between min-h-[130px]">
              <div className="text-xs font-semibold text-blue-200 mb-1">Open access</div>
              <div className="text-2xl font-bold mb-1">Zero cost</div>
              <p className="text-[11px] text-slate-200">Start practising today with no sign-up barrier.</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between min-h-[130px] col-span-2">
              <div className="text-xs font-semibold text-slate-500 mb-1">Made for long prep journeys</div>
              <p className="text-sm text-slate-700">
                Switch between subjects, save attempts, and return any time without losing where you left off.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LibrarySection() {
  return (
    <section id="library-preview" className="mb-16 md:mb-20 scroll-mt-24">
      <div className="site-card p-8 md:p-12 flex flex-col md:flex-row-reverse md:items-start gap-10">
        <div className="flex-1 md:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 mb-2">Resources</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Study Library</h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4 md:ml-auto max-w-xl">
            Keep all your reference material in one organised place - notes, PDFs, formula sheets, and quick revision guides.
          </p>
          <ul className="space-y-2 text-sm text-slate-600 mb-6 md:ml-auto max-w-xl">
            <li>Tag content by subject and type so you can pull up exactly what you need before a mock.</li>
            <li>Combine question practice with curated reading for deeper understanding of tricky topics.</li>
          </ul>
          <Link to="/library" className="btn-institute-primary inline-flex items-center gap-2 md:ml-auto">
            Open Library
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="flex-shrink-0 w-full md:w-56">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex items-center justify-center text-blue-600 mb-4">
            <IconBook className="w-16 h-16 md:w-20 md:h-20" size="xl" />
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-4 text-left text-sm text-slate-700 shadow-sm">
            <p className="font-semibold mb-1">Example stack</p>
            <p className="text-xs text-slate-500 mb-1">Air Navigation · Quick formulas</p>
            <p className="text-xs">
              Distance, time, fuel, and wind components in one cheat sheet - perfect for last-minute review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeedbackSection() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const firstName = useMemo(() => {
    const raw = user?.username || user?.email || '';
    if (!raw) return '';
    return raw.split(/[\s@._-]+/)[0];
  }, [user]);

  const userEmail = useMemo(() => user?.email || '', [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    try {
      const supportEmail = 'contactvimaanna@gmail.com';
      const subject = 'Feedback & Suggestion from VIMAANNA Portal';
      let body = `User: ${firstName || 'Guest'}\n`;
      if (userEmail) body += `Email: ${userEmail}\n`;
      body += `\n--- FEEDBACK & SUGGESTION ---\n${feedback.trim()}\n\n`;
      body += `---\nSubmitted from: ${window.location.href}\n`;
      body += `Timestamp: ${new Date().toLocaleString()}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
      setSubmitted(true);
      setFeedback('');
      setTimeout(() => {
        setSubmitted(false);
        setIsSubmitting(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to prepare feedback. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="site-card p-6 md:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Feedback & Suggestions</h2>
            <p className="text-sm text-slate-600 mt-1">We value your input. Share your thoughts to help us improve.</p>
        </div>
      </div>
        {submitted && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-emerald-800 font-medium">Feedback submitted! Gmail compose window should open shortly.</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="feedback" className="block text-sm font-semibold text-slate-700 mb-2">
              Feedback & Suggestions
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your feedback, suggestions, or any ideas to help us improve..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Your feedback will be sent via Gmail
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              className="btn-institute-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Feedback
                </>
              )}
            </button>
          </div>
        </form>
    </section>
  );
}
