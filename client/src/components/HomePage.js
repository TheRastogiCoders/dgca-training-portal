import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import { API_ENDPOINTS } from '../config/api';

const TOTAL_CHAPTERS = 78;

const HomePage = () => (
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
);

export default HomePage;

const DashboardOverview = () => {
  const { user } = useAuth();
  const [statsLoading, setStatsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    chaptersCompleted: 0,
    chaptersThisWeek: 0,
    totalChapters: TOTAL_CHAPTERS,
    accuracy: 0,
    accuracyLatest: 0,
    testsAttempted: 0,
    testsThisWeek: 0,
    studyHours: 0,
    studyHoursThisWeek: 0
  });

  const firstName = useMemo(() => {
    const raw = user?.username || user?.email || '';
    if (!raw) return '';
    return raw.split(/[\s@._-]+/)[0];
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      if (!user) {
        setDashboardStats(calculateDashboardStats([]));
        setStatsLoading(false);
        return;
      }
      setStatsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setDashboardStats(prev => ({ ...prev }));
          return;
        }

        const res = await fetch(API_ENDPOINTS.RESULTS, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to load stats');
        }

        const data = await res.json();
        if (!isMounted) return;
        setDashboardStats(calculateDashboardStats(data));
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        if (isMounted) {
          setDashboardStats(prev => ({ ...prev }));
        }
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const continueLearning = {
    title: 'Piper Archer III DX',
    chapter: 'Propeller Control & Limits',
    subject: 'Technical Specific',
    progress: 72,
    to: '/pyq/book/question-bank/piper-archer-iii-dx'
  };

  const announcements = [
    { title: 'New PYQ Set Added', detail: 'November 2025 Air Navigation PYQs are now live.', badge: 'New' },
    { title: 'Mock Test Marathon', detail: 'Join the weekend mock series to boost your accuracy.', badge: 'Event' }
  ];

  const statCards = useMemo(
    () => [
      {
        label: 'Chapters Completed',
        value: statsLoading ? '—' : `${dashboardStats.chaptersCompleted} / ${dashboardStats.totalChapters}`,
        trend: statsLoading
          ? 'Syncing...'
          : dashboardStats.chaptersThisWeek
            ? `+${dashboardStats.chaptersThisWeek} this week`
            : 'No new chapters this week'
      },
      {
        label: 'Accuracy',
        value: statsLoading ? '—' : `${dashboardStats.accuracy}%`,
        trend: statsLoading
          ? 'Syncing...'
          : dashboardStats.testsAttempted
            ? `Last test ${dashboardStats.accuracyLatest}%`
            : 'Attempt a test to track'
      },
      {
        label: 'Tests Attempted',
        value: statsLoading ? '—' : dashboardStats.testsAttempted,
        trend: statsLoading
          ? 'Syncing...'
          : dashboardStats.testsThisWeek
            ? `${dashboardStats.testsThisWeek} this week`
            : 'No tests this week'
      },
      {
        label: 'Study Time',
        value: statsLoading ? '—' : `${dashboardStats.studyHours} hrs`,
        trend: statsLoading
          ? 'Syncing...'
          : dashboardStats.studyHoursThisWeek
            ? `+${dashboardStats.studyHoursThisWeek} hrs this week`
            : 'No tracked time yet'
      }
    ],
    [dashboardStats, statsLoading]
  );

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

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-4 shadow-lg hover:shadow-xl transition"
            >
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">{stat.value}</p>
              <p className="text-sm text-emerald-600 mt-1">{stat.trend}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

function calculateDashboardStats(results = []) {
  const stats = {
    chaptersCompleted: 0,
    chaptersThisWeek: 0,
    totalChapters: TOTAL_CHAPTERS,
    accuracy: 0,
    accuracyLatest: 0,
    testsAttempted: 0,
    testsThisWeek: 0,
    studyHours: 0,
    studyHoursThisWeek: 0
  };

  if (!Array.isArray(results) || results.length === 0) {
    return stats;
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const chaptersAll = new Set();
  const chaptersWeek = new Set();
  let totalPercent = 0;
  let attemptsWithScore = 0;
  let totalSeconds = 0;
  let weekSeconds = 0;
  let testsThisWeek = 0;

  const percentOf = (score, total) => {
    if (!total) return 0;
    return (score / total) * 100;
  };

  results.forEach((result) => {
    const completedAt = result?.createdAt ? new Date(result.createdAt) : null;
    const percent = percentOf(result?.score || 0, result?.total || 0);
    if (Number.isFinite(percent)) {
      totalPercent += percent;
      attemptsWithScore += 1;
    }

    totalSeconds += result?.timeSpent || 0;

    const chapterLabel = result?.chapterName || result?.chapter?.name;
    if (chapterLabel) {
      chaptersAll.add(chapterLabel);
    }

    if (completedAt && completedAt >= weekAgo) {
      testsThisWeek += 1;
      weekSeconds += result?.timeSpent || 0;
      if (chapterLabel) {
        chaptersWeek.add(chapterLabel);
      }
    }
  });

  const averagePercent = attemptsWithScore ? Math.round((totalPercent / attemptsWithScore) * 10) / 10 : 0;
  const latestPercent = results[0] ? Math.round(percentOf(results[0].score || 0, results[0].total || 0)) : 0;

  return {
    chaptersCompleted: chaptersAll.size,
    chaptersThisWeek: chaptersWeek.size,
    totalChapters: TOTAL_CHAPTERS,
    accuracy: averagePercent,
    accuracyLatest: latestPercent,
    testsAttempted: results.length,
    testsThisWeek,
    studyHours: roundOneDecimal(totalSeconds / 3600),
    studyHoursThisWeek: roundOneDecimal(weekSeconds / 3600)
  };
}

function roundOneDecimal(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isFinite(rounded) ? rounded : 0;
}
