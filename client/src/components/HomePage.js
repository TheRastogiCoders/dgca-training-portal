import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import SEO from './SEO';

const HomePage = () => (
  <>
    <SEO
      title="VIMAANNA - DGCA Exam Preparation | Pilot License Exam (CPL/ATPL) Practice Tests, Question Bank & Study Materials"
      description="Best DGCA exam preparation platform for pilot license exams (CPL, ATPL). Practice tests, PYQ sessions, question banks for Air Regulations, Meteorology, Air Navigation, Technical General. Free aviation exam preparation, pilot exam questions, and study materials. Prepare for commercial pilot license and airline transport pilot license exams."
      keywords="DGCA exam, DGCA preparation, DGCA practice test, DGCA question bank, DGCA study material, Air Regulations DGCA, Meteorology DGCA, Air Navigation DGCA, Technical General DGCA, DGCA pilot exam, DGCA CPL exam, DGCA ATPL exam, DGCA online test, DGCA previous year questions, DGCA mock test, aviation exam preparation, pilot license exam, DGCA training, DGCA coaching, pilot exam, pilot license, CPL exam, ATPL exam, commercial pilot license, airline transport pilot license, aviation training, pilot training, aviation exam, pilot test, aviation questions, pilot questions, DGCA syllabus, aviation syllabus, pilot syllabus, DGCA exam pattern, pilot exam pattern, aviation exam pattern, DGCA exam date, pilot exam date, aviation exam date, DGCA result, pilot exam result, aviation exam result, DGCA online coaching, pilot online coaching, aviation online coaching, DGCA study guide, pilot study guide, aviation study guide, DGCA books, pilot books, aviation books, DGCA notes, pilot notes, aviation notes, DGCA mock test online, pilot mock test, aviation mock test, DGCA sample papers, pilot sample papers, aviation sample papers, DGCA previous papers, pilot previous papers, aviation previous papers, Indian aviation exam, Indian pilot exam, India DGCA, DGCA India, aviation India, pilot India, commercial pilot India, airline pilot India, flight training India, aviation academy India, pilot academy India, how to become pilot, pilot career, aviation career, pilot license India, CPL license India, ATPL license India"
    />
  <div className="min-h-screen gradient-bg overflow-hidden">
    <div className="flex">
      <SiteSidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-24 md:pb-8 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
        <div className="max-w-6xl mx-auto space-y-10">
          <DashboardOverview />
        </div>
      </main>
    </div>
  </div>
  </>
);

export default HomePage;

const DashboardOverview = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const firstName = useMemo(() => {
    const raw = user?.username || user?.email || '';
    if (!raw) return '';
    return raw.split(/[\s@._-]+/)[0];
  }, [user]);

  const userEmail = useMemo(() => {
    return user?.email || '';
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const supportEmail = 'contactvimaanna@gmail.com';
      const subject = 'Feedback & Suggestion from VIMAANNA Portal';
      
      let body = `User: ${firstName || 'Guest'}\n`;
      if (userEmail) {
        body += `Email: ${userEmail}\n`;
      }
      body += `\n--- FEEDBACK & SUGGESTION ---\n${feedback.trim()}\n\n`;
      body += `---\nSubmitted from: ${window.location.href}\n`;
      body += `Timestamp: ${new Date().toLocaleString()}`;
      
      // Open Gmail compose window
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
      
      // Show success message
      setSubmitted(true);
      setFeedback('');
      
      setTimeout(() => {
        setSubmitted(false);
        setIsSubmitting(false);
      }, 3000);
    } catch (error) {
      console.error('Error preparing feedback:', error);
      alert('Failed to prepare feedback. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="relative bg-white/10 backdrop-blur-3xl rounded-3xl border border-white/25 shadow-2xl p-6 md:p-10 overflow-hidden">
        <div className="absolute -right-10 top-0 w-40 h-40 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 opacity-40 blur-[90px] animate-pulse" />
        <div className="absolute -left-6 -bottom-10 w-48 h-48 bg-gradient-to-br from-cyan-400 to-blue-500 opacity-30 blur-[120px] animate-ping" />

        <div className="relative flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-blue-500">Dashboard</p>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mt-4 flex items-center gap-3">
              Welcome to VIMAANNA
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white animate-bounce shadow-lg">
                ✈️
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 font-semibold mt-2 tracking-[0.4em] uppercase">
              Wings within reach
            </p>
            <p className="text-gray-600 mt-4 max-w-3xl leading-relaxed">
              Hey, <span className="font-semibold text-blue-600">{firstName || 'Pilot'}</span>. Stay mission-ready with curated study flows,
              beautiful analytics, and everything you need to clear your next DGCA attempt with confidence.
            </p>
          </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/question-bank"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition"
              >
                Start practicing
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/pyq"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-blue-200 text-blue-600 font-semibold bg-white/40 backdrop-blur hover:bg-white/60 transition"
              >
                Review PYQs
              </Link>
            </div>
        </div>

        {/* Feedback and Suggestion Section */}
        <div className="relative mt-8">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 md:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Feedback & Suggestions</h2>
                <p className="text-sm text-gray-600 mt-1">We value your input! Share your thoughts to help us improve.</p>
              </div>
            </div>

            {submitted && (
              <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-emerald-700 font-medium">Feedback submitted! Gmail compose window should open shortly.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="feedback" className="block text-sm font-semibold text-gray-700 mb-2">
                  Feedback & Suggestions
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your feedback, suggestions, or any ideas to help us improve..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-500">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Your feedback will be sent via Gmail
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
          </div>
        </div>
      </section>

    </div>
  );
};
