import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Card from './ui/Card';
import SiteSidebar from './SiteSidebar';

const friendly = (slug) => (slug || '')
  .split('-')
  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
  .join(' ');

const ChapterPracticeIntro = () => {
  const navigate = useNavigate();
  const { subjectSlug, bookSlug, chapterSlug } = useParams();

  const startPractice = () => {
    // Practice temporarily unavailable
    alert('Questions are not available right now. Please check back soon.');
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 md:ml-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/question-bank" className="text-blue-600 hover:underline">← Back to Subjects</Link>
        </div>
        <Card className="p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {friendly(subjectSlug)} • {friendly(chapterSlug)}
            </h1>
            <p className="text-gray-600">Questions are not available right now for this chapter.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-sm text-gray-500">Total Questions</div>
              <div className="text-2xl font-bold">—</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">Difficulty</div>
              <div className="text-2xl font-bold">Mixed</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">Time per Question</div>
              <div className="text-2xl font-bold">60s</div>
            </Card>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">How it works</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Each question has 4 options; select the best answer.</li>
              <li>Get instant correctness feedback with explanations when available.</li>
              <li>Your progress is saved for later review.</li>
            </ul>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={startPractice}
              className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
              disabled
            >
              Practice Unavailable
            </button>
            <Link to="/question-bank" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">
              Back to Question Bank
            </Link>
          </div>
        </Card>
      </div>
        </main>
      </div>
    </div>
  );
};

export default ChapterPracticeIntro;


