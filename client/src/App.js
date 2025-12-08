import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Header from './components/Header';
import './App.css';
import Footer from './components/Footer';
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
const SamplePapersList = lazy(() => import('./components/SamplePapersList'));
const SamplePaperViewer = lazy(() => import('./components/SamplePaperViewer'));
const WhatsAppFloat = lazy(() => import('./components/WhatsAppFloat'));
const ContactSupport = lazy(() => import('./components/ContactSupport'));
const Profile = lazy(() => import('./components/Profile'));
const StudentsLogins = lazy(() => import('./components/admin/StudentsLogins'));
const QuestionUpload = lazy(() => import('./components/admin/QuestionUpload'));
const Reports = lazy(() => import('./components/admin/Reports'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const appShell = document.querySelector('.App');
    if (appShell) {
      appShell.scrollTop = 0;
    }
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
              <div className="app-wrapper">
                <Header />
                <Suspense fallback={<LoadingSpinner size="large" text="Loading application..." />}>
                  <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/library" element={<Library />} />
                <Route path="/question-bank" element={<QuestionBank />} />
                <Route path="/pyq" element={<PracticeTest />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/books/air-regulations" element={<BookSelection />} />
                <Route path="/books/air-navigation" element={<BookSelection />} />
                <Route path="/books/meteorology" element={<BookSelection />} />
                <Route path="/books/technical-general" element={<BookSelection />} />
                <Route path="/books/technical-specific" element={<BookSelection />} />
                <Route path="/books/radio-telephony" element={<BookSelection />} />
                <Route path="/questions/:subjectSlug/:bookSlug" element={<BookChapters />} />
                <Route path="/pyq/ai" element={<AIPracticeSubject />} />
                <Route path="/pyq/ai/:subjectSlug" element={<AIPracticeBooks />} />
                <Route path="/pyq/ai/:subjectSlug/:bookSlug" element={<AIPracticeChapters />} />
                <Route path="/pyq/ai/:subjectSlug/:bookSlug/:chapterSlug" element={<AIPracticeRunner />} />
                <Route path="/pyq/book/:bookSlug" element={<BookPracticeRunner />} />
                <Route path="/pyq/book/:bookSlug/:chapterSlug" element={<BookPracticeRunner />} />
                <Route path="/sample-papers/:subjectSlug/:bookSlug" element={<SamplePapersList />} />
                <Route path="/sample-papers/:subjectSlug/:bookSlug/:paperSlug" element={<SamplePaperViewer />} />
                <Route path="/practice/:subjectSlug/:bookSlug/:chapterSlug" element={<ChapterPracticeIntro />} />
                {/* Admin routes */}
                <Route path="/admin/students-logins" element={<StudentsLogins />} />
                <Route path="/admin/question-upload" element={<QuestionUpload />} />
                <Route path="/admin/reports" element={<Reports />} />
                {/* Hidden route: not linked from navigation */}
                <Route path="/support/contact" element={<ContactSupport />} />
                </Routes>
                </Suspense>
                <WhatsAppFloat />
              </div>
              <Footer />
            </div>
          </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
