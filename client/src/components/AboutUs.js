import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import GLOBAL_ASSETS from '../config/globalAssets';
import { IconClipboard, IconLibrary, IconBook } from './ui/Icons';

const TAGLINES = [
  'Wings within reach.',
  'Your trusted partner for DGCA exam preparation.',
  'Quality preparation. Zero cost.',
  'From ground school to the cockpit - we’re with you.',
];

const WHAT_WE_DO = [
  {
    Icon: IconClipboard,
    title: 'Question Bank',
    description: 'Thousands of DGCA-style questions by subject - Air Regulations, Meteorology, Air Navigation, Technical General. Practice with explanations, track progress, and identify weak areas.',
    to: '/question-bank',
  },
  {
    Icon: IconLibrary,
    title: 'Previous Year Questions (PYQ)',
    description: 'Curated PYQ sessions so you can practice real exam patterns and high-weightage topics. Revise the way the DGCA tests.',
    to: '/pyq',
  },
  {
    Icon: IconBook,
    title: 'Study Library',
    description: 'Notes, references, and study materials in one place. Filter by subject and type. Everything you need, organized in one place.',
    to: '/library',
  },
];

const WHY_STUDENTS = [
  { point: 'High-quality study material with no paywalls.' },
  { point: 'Aligned with DGCA syllabus and exam pattern.' },
  { point: 'Practice tests and PYQs to build exam confidence.' },
  { point: 'Simple, student-friendly platform - focus on learning.' },
];

const AboutUs = () => {
  return (
    <>
      <SEO
        title="About VIMAANNA | DGCA Exam Preparation - Wings Within Reach"
        description="Learn about VIMAANNA - India's trusted DGCA exam preparation platform for CPL/ATPL. Our mission: accessible study material for every aspiring pilot. Question banks, PYQ, and library."
        keywords="VIMAANNA about, DGCA training, pilot exam preparation, CPL ATPL India, aviation education, DGCA coaching, DGCA study material"
      />
      <div className="min-h-screen gradient-bg">
        <main className="page-content">
          <div className="page-content-inner">
            {/* Hero: logo + tagline */}
            <section className="text-center mb-14 md:mb-20">
              <div className="flex justify-center mb-6">
                <img
                  src={GLOBAL_ASSETS.LOGO}
                  alt="VIMAANNA - DGCA Exam Preparation"
                  className="h-20 sm:h-24 md:h-28 w-auto max-w-[220px] object-contain drop-shadow-lg"
                />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600 mb-4">
                About VIMAANNA
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Wings within reach
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                Your trusted partner for DGCA exam preparation. We’re here to make quality study material accessible for every aspiring pilot.
              </p>
            </section>

            {/* Mission: accessible study material */}
            <section className="site-card p-8 md:p-12 mb-12 md:mb-16">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                  Our mission
                </h2>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6">
                  To provide <strong className="text-blue-700">high-quality study material</strong> so that every student - regardless of background - can prepare for DGCA exams (CPL & ATPL) with confidence. No subscriptions, no hidden fees. Just practice, PYQs, and a library built for pilots.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  We believe wings should be within reach. That’s why we built VIMAANNA: one place for question banks, previous year questions, and study resources - all aligned with the DGCA syllabus.
                </p>
              </div>
            </section>

            {/* What we do */}
            <section className="mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8 md:mb-10">
                What we do
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {WHAT_WE_DO.map((item, i) => (
                  <div key={i} className="site-card p-6 md:p-8 h-full flex flex-col">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 shadow-lg">
                      {item.Icon && <item.Icon className="w-7 h-7" size="md" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-6">
                      {item.description}
                    </p>
                    <Link
                      to={item.to}
                      className="text-blue-600 font-semibold text-sm inline-flex items-center gap-1 hover:underline"
                    >
                      Explore
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Taglines / Why students choose us */}
            <section className="site-card p-8 md:p-12 mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
                Why students choose VIMAANNA
              </h2>
              <ul className="space-y-4 max-w-2xl mx-auto">
                {WHY_STUDENTS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      ✓
                    </span>
                      <span className="text-base md:text-lg">{item.point}</span>
                    </li>
                  ))}
                </ul>
              <div className="mt-10 pt-8 border-t border-slate-200 text-center">
                <p className="text-slate-600 font-medium italic">
                  &ldquo;{TAGLINES[0]}&rdquo;
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  - VIMAANNA
                </p>
              </div>
            </section>

            {/* Extra taglines strip */}
            <section className="mb-12 md:mb-16">
              <div className="site-card-glass p-6 md:p-8">
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-center">
                  {TAGLINES.slice(1).map((line, i) => (
                    <p key={i} className="text-slate-700 font-medium text-sm md:text-base">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="vimaanna-cta-block">
              <h3 className="vimaanna-cta-title text-2xl md:text-3xl">
                Ready to start?
              </h3>
              <p className="vimaanna-cta-desc">
                Explore the Question Bank, practice PYQs, or open the Library. Sign in to track your progress.
              </p>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                <Link to="/question-bank" className="btn-cta-primary inline-flex items-center gap-2">
                  Question Bank
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/pyq" className="btn-cta-secondary">
                  PYQ Practice
                </Link>
                <Link to="/library" className="btn-cta-secondary">
                  Library
                </Link>
                <Link to="/login" className="btn-cta-secondary">
                  Login
                </Link>
              </div>
            </section>

            {/* Contact */}
            <section className="mt-10 md:mt-14 text-center">
              <p className="text-slate-600 text-sm md:text-base">
                Questions or feedback? Reach us at{' '}
                <a
                  href="mailto:contactvimaanna@gmail.com"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  contactvimaanna@gmail.com
                </a>
              </p>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default AboutUs;
