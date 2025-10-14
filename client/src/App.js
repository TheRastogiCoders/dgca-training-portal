import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
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
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const ProtectedAdminPanel = lazy(() => import('./components/ProtectedAdminPanel'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const AdminProtectedRoute = lazy(() => import('./components/AdminProtectedRoute'));
const AdminDomainGuard = lazy(() => import('./components/AdminDomainGuard'));
const AdminQuestions = lazy(() => import('./components/AdminQuestions'));
const AdminAnalysisQuestions = lazy(() => import('./components/AdminAnalysisQuestions'));
const BookChapters = lazy(() => import('./components/BookChapters'));
const AIPracticeSubject = lazy(() => import('./components/AIPracticeSubject'));
const AIPracticeBooks = lazy(() => import('./components/AIPracticeBooks'));
const AIPracticeRunner = lazy(() => import('./components/AIPracticeRunner'));
const AIPracticeChapters = lazy(() => import('./components/AIPracticeChapters'));
const ChapterPracticeIntro = lazy(() => import('./components/ChapterPracticeIntro'));
const BookPracticeRunner = lazy(() => import('./components/BookPracticeRunner'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminSettings = lazy(() => import('./components/AdminSettings'));
const AdminResults = lazy(() => import('./components/AdminResults'));
const AdminLogs = lazy(() => import('./components/admin/AdminLogs'));
const AdminUsers = lazy(() => import('./components/admin/AdminUsers'));
const WhatsAppFloat = lazy(() => import('./components/WhatsAppFloat'));

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
        <AdminAuthProvider>
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
              <Route path="/practice/:subjectSlug/:bookSlug/:chapterSlug" element={<ChapterPracticeIntro />} />
              <Route path="/admin-analysis-questions" element={<AdminAnalysisQuestions />} />
              <Route path="/admin" element={<AdminDomainGuard><AdminLogin /></AdminDomainGuard>} />
              <Route path="/admin-dashboard" element={<AdminDomainGuard><AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute></AdminDomainGuard>} />
              <Route path="/admin-panel" element={<AdminDomainGuard><AdminProtectedRoute><AdminPanel /></AdminProtectedRoute></AdminDomainGuard>} />
              <Route path="/admin-settings" element={<AdminDomainGuard><AdminProtectedRoute><AdminSettings /></AdminProtectedRoute></AdminDomainGuard>} />
              <Route path="/admin-results" element={<AdminDomainGuard><AdminProtectedRoute><AdminResults /></AdminProtectedRoute></AdminDomainGuard>} />
              <Route path="/admin-questions" element={<AdminDomainGuard><AdminProtectedRoute><AdminQuestions /></AdminProtectedRoute></AdminDomainGuard>} />
              <Route path="/admin/logs" element={<AdminDomainGuard><AdminProtectedRoute><AdminLogs /></AdminProtectedRoute></AdminDomainGuard>} />
              <Route path="/admin/users" element={<AdminDomainGuard><AdminProtectedRoute><AdminUsers /></AdminProtectedRoute></AdminDomainGuard>} />
              </Routes>
              </Suspense>
              <WhatsAppFloat />
            </div>
          </Router>
        </AdminAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
