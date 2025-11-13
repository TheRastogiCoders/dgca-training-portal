import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Header from './components/Header';
import './App.css';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Lazy load components for code splitting
const HomePage = lazy(() => import('./components/HomePage'));
const Library = lazy(() => import('./components/Library'));
const QuestionBank = lazy(() => import('./components/QuestionBank'));
const PracticeTest = lazy(() => import('./components/PracticeTest'));
const BookSelection = lazy(() => import('./components/BookSelection'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const BookChapters = lazy(() => import('./components/BookChapters'));
const AIPracticeSubject = lazy(() => import('./components/AIPracticeSubject'));
const AIPracticeBooks = lazy(() => import('./components/AIPracticeBooks'));
const AIPracticeRunner = lazy(() => import('./components/AIPracticeRunner'));
const AIPracticeChapters = lazy(() => import('./components/AIPracticeChapters'));
const ChapterPracticeIntro = lazy(() => import('./components/ChapterPracticeIntro'));
const BookPracticeRunner = lazy(() => import('./components/BookPracticeRunner'));
const WhatsAppFloat = lazy(() => import('./components/WhatsAppFloat'));
const ContactSupport = lazy(() => import('./components/ContactSupport'));
const Profile = lazy(() => import('./components/Profile'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <div className="App">
              <Header />
              <Suspense fallback={<LoadingSpinner size="large" text="Loading application..." />}>
                <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/library" element={<Library />} />
              <Route path="/question-bank" element={<QuestionBank />} />
              <Route path="/practice-test" element={<PracticeTest />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/books/air-regulations" element={<BookSelection />} />
              <Route path="/books/air-navigation" element={<BookSelection />} />
              <Route path="/books/meteorology" element={<BookSelection />} />
              <Route path="/books/technical-general" element={<BookSelection />} />
              <Route path="/books/technical-specific" element={<BookSelection />} />
              <Route path="/books/radio-telephony" element={<BookSelection />} />
              <Route path="/questions/:subjectSlug/:bookSlug" element={<BookChapters />} />
              <Route path="/practice-test/ai" element={<AIPracticeSubject />} />
              <Route path="/practice-test/ai/:subjectSlug" element={<AIPracticeBooks />} />
              <Route path="/practice-test/ai/:subjectSlug/:bookSlug" element={<AIPracticeChapters />} />
              <Route path="/practice-test/ai/:subjectSlug/:bookSlug/:chapterSlug" element={<AIPracticeRunner />} />
              <Route path="/practice-test/book/:bookSlug" element={<BookPracticeRunner />} />
              <Route path="/practice-test/book/:bookSlug/:chapterSlug" element={<BookPracticeRunner />} />
              <Route path="/practice/:subjectSlug/:bookSlug/:chapterSlug" element={<ChapterPracticeIntro />} />
              {/* Admin routes removed */}
              {/* Hidden route: not linked from navigation */}
              <Route path="/support/contact" element={<ContactSupport />} />
              </Routes>
              </Suspense>
              <WhatsAppFloat />
            </div>
          </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
