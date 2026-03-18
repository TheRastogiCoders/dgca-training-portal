import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Stepper from './ui/Stepper';
import Card from './ui/Card';
import LoginModal from './LoginModal';

const BookSelection = () => {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  // Get subject from URL or default
  const getSubjectFromUrl = () => {
    const path = window.location.pathname;
    const subjectMap = {
      '/books/air-regulations': 'Air Regulations',
      '/books/air-navigation': 'Air Navigation',
      '/books/meteorology': 'Meteorology',
      '/books/technical-general': 'Technical General',
      '/books/technical-specific': 'Technical Specific',
      '/books/radio-telephony': 'Radio Telephony (RTR)-A'
    };
    return subjectMap[path] || 'DGCA Subject';
  };

  const subject = getSubjectFromUrl();

  const [serverBooks, setServerBooks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-');
        const res = await fetch(`/api/practice-books?subject=${encodeURIComponent(subjectSlug)}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setServerBooks(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        setServerBooks(null); // will fallback below
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
    return () => controller.abort();
  }, [subject]);

  const books = useMemo(() => {
    const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-');
    if (Array.isArray(serverBooks) && serverBooks.length > 0) {
      return serverBooks.map((b, idx) => ({
        id: idx + 1,
        title: b.title,
        description: b.description,
        color: b.color || '#6366f1',
        icon: b.icon || '📘',
        slug: b.slug,
        route: `/questions/${subjectSlug}/${b.slug}`
      }));
    }
    // Fallback to two default books if server not available yet
    return [
      {
        id: 1,
        title: "IC Joshi",
        description: "Comprehensive DGCA exam preparation",
        color: "#3b82f6",
        icon: "📖",
        slug: "ic-joshi",
        route: `/questions/${subjectSlug}/ic-joshi`
      },
      {
        id: 2,
        title: "Oxford",
        description: "Advanced aviation knowledge & practice",
        color: "#10b981",
        icon: "📚",
        slug: "oxford",
        route: `/questions/${subjectSlug}/oxford`
      }
    ];
  }, [serverBooks, subject]);

  const handleLogin = () => {
    setShowLogin(false);
  };

  const handleBookClick = (book) => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    navigate(book.route);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <main className="page-content">
        <div className="page-content-inner max-w-5xl mx-auto">
            <Stepper steps={["Subject", "Book", "Chapter", "Practice"]} current={1} />
            <div className="mb-6 mt-2">
              <Link to="/question-bank" className="text-blue-600 hover:underline">← Back to Subjects</Link>
            </div>
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{subject}</h1>
              <p className="text-gray-600">Choose your study material to start practicing</p>
            </div>
            {!isAuthenticated && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800"><span className="font-semibold">Login required:</span> Please log in to access questions.</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {loading && (
                <div className="col-span-2 text-center text-gray-600">Loading books...</div>
              )}
              {!loading && books.map((book) => (
                <Card key={book.id} className="p-6 cursor-pointer" onClick={() => handleBookClick(book)}>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-slate-900" style={{ backgroundColor: book.color }}>
                      {book.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {subject === 'Air Regulations' && (book.slug === 'oxford' || book.title === 'Oxford' || book.title === 'CAE Oxford')
                          ? 'Air Law'
                          : book.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{book.description}</p>
                      <div className="mt-4 inline-flex items-center text-blue-600 font-medium">Start <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
      </main>
      {showLogin && (
        <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
};

export default BookSelection;
