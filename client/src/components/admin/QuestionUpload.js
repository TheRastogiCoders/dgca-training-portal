import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SiteSidebar from '../SiteSidebar';
import Card from '../ui/Card';
import { API_ENDPOINTS } from '../../config/api';

const QuestionUpload = () => {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingStructure, setLoadingStructure] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  // Books structure data
  const [booksStructure, setBooksStructure] = useState({ subjects: [], pyqSessions: {} });
  
  // Form state
  const [uploadType, setUploadType] = useState('book'); // 'book' or 'pyq'
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedPyqSession, setSelectedPyqSession] = useState('');
  const [questions, setQuestions] = useState([{
    question: '',
    options: ['', '', '', ''],
    solution: ''
  }]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !isAdmin()) {
      navigate('/login');
      return;
    }
    
    fetchBooksStructure();
  }, [isAuthenticated, authLoading, navigate]);

  const fetchBooksStructure = async () => {
    try {
      setLoadingStructure(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ADMIN_BOOKS_STRUCTURE, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch books structure');
      }
      
      const data = await response.json();
      setBooksStructure(data);
    } catch (err) {
      console.error('Error fetching books structure:', err);
      setError('Failed to load books structure. Please refresh the page.');
    } finally {
      setLoadingStructure(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'uploadType') {
      setUploadType(value);
      // Reset selections when switching type
      setSelectedSubject('');
      setSelectedBook('');
      setSelectedChapter('');
      setSelectedPyqSession('');
    } else if (name === 'subject') {
      setSelectedSubject(value);
      setSelectedBook('');
      setSelectedChapter('');
    } else if (name === 'book') {
      setSelectedBook(value);
      setSelectedChapter('');
    } else if (name === 'chapter') {
      setSelectedChapter(value);
    } else if (name === 'pyqSession') {
      setSelectedPyqSession(value);
    }
    setError(null);
    setSuccess(null);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuestions(newQuestions);
    setError(null);
    setSuccess(null);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[questionIndex].options];
    newOptions[optionIndex] = value;
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: newOptions
    };
    setQuestions(newQuestions);
    setError(null);
    setSuccess(null);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        solution: ''
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const getSelectedSubjectData = () => {
    return booksStructure.subjects.find(s => s.slug === selectedSubject);
  };

  const getSelectedBookData = () => {
    const subjectData = getSelectedSubjectData();
    if (!subjectData) return null;
    return subjectData.books.find(b => b.slug === selectedBook);
  };

  const getSelectedChapterData = () => {
    const bookData = getSelectedBookData();
    if (!bookData) return null;
    return bookData.chapters.find(c => c.slug === selectedChapter || c.id === selectedChapter);
  };

  const getUploadPath = () => {
    if (uploadType === 'pyq') {
      if (!selectedSubject || !selectedPyqSession) return null;
      const subjectName = getSelectedSubjectData()?.name || selectedSubject;
      return `client/src/data/${subjectName.toLowerCase().replace(/\s+/g, '-')}-${selectedPyqSession}.json`;
    } else {
      if (!selectedSubject || !selectedBook || !selectedChapter) return null;
      const subjectName = getSelectedSubjectData()?.name || selectedSubject;
      const bookSlug = selectedBook;
      const chapterSlug = selectedChapter;
      return `client/src/data/${subjectName.toLowerCase().replace(/\s+/g, '-')}-${bookSlug}-${chapterSlug}.json`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (uploadType === 'book') {
      if (!selectedSubject || !selectedBook || !selectedChapter) {
        setError('Please select Subject, Book, and Chapter');
        setLoading(false);
        return;
      }
    } else {
      if (!selectedSubject || !selectedPyqSession) {
        setError('Please select Subject and PYQ Session');
        setLoading(false);
        return;
      }
    }

    if (!questions || questions.length === 0) {
      setError('At least one question is required');
      setLoading(false);
      return;
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || q.question.trim() === '') {
        setError(`Question ${i + 1}: Question text is required`);
        setLoading(false);
        return;
      }
      if (!q.options || q.options.length < 4) {
        setError(`Question ${i + 1}: At least 4 options are required`);
        setLoading(false);
        return;
      }
      if (q.options.some(opt => !opt || opt.trim() === '')) {
        setError(`Question ${i + 1}: All options must be filled`);
        setLoading(false);
        return;
      }
      if (!q.solution || q.solution.trim() === '') {
        setError(`Question ${i + 1}: Solution/Answer is required`);
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const subjectName = getSelectedSubjectData()?.name || selectedSubject;
      
      const payload = {
        subject: subjectName,
        uploadType,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options,
          solution: q.solution
        }))
      };

      if (uploadType === 'book') {
        const bookData = getSelectedBookData();
        const chapterData = getSelectedChapterData();
        payload.book = bookData?.title || selectedBook;
        payload.bookSlug = selectedBook;
        payload.chapter = chapterData?.title || selectedChapter;
        payload.chapterSlug = selectedChapter;
      } else {
        payload.pyqSession = selectedPyqSession;
        const sessionData = booksStructure.pyqSessions[selectedSubject]?.find(s => s.slug === selectedPyqSession);
        payload.pyqSessionTitle = sessionData?.title || selectedPyqSession;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN_UPLOAD_QUESTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload questions');
      }

      setSuccess(`Successfully uploaded ${questions.length} question(s) to ${getUploadPath() || 'the selected location'}!`);
      
      // Reset form
      setSelectedSubject('');
      setSelectedBook('');
      setSelectedChapter('');
      setSelectedPyqSession('');
      setQuestions([{
        question: '',
        options: ['', '', '', ''],
        solution: ''
      }]);
    } catch (err) {
      console.error('Error uploading questions:', err);
      setError(err.message || 'Failed to upload questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loadingStructure) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {loadingStructure ? 'Loading books structure...' : 'Loading...'}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const selectedSubjectData = getSelectedSubjectData();
  const selectedBookData = getSelectedBookData();
  const selectedChapterData = getSelectedChapterData();
  const uploadPath = getUploadPath();

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        <SiteSidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Question Upload
              </h1>
              <p className="text-gray-600">
                Upload new questions to the platform. Select the location where questions will be saved.
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <Card className="p-4 mb-6 bg-green-50 border-2 border-green-200">
                <p className="text-green-700">{success}</p>
              </Card>
            )}

            {/* Error Message */}
            {error && (
              <Card className="p-4 mb-6 bg-red-50 border-2 border-red-200">
                <p className="text-red-700">{error}</p>
              </Card>
            )}

            {/* Form */}
            <Card className="p-6 mb-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Type *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="uploadType"
                        value="book"
                        checked={uploadType === 'book'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>Book Chapter Questions</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="uploadType"
                        value="pyq"
                        checked={uploadType === 'pyq'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>PYQ Session Questions</span>
                    </label>
                  </div>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={selectedSubject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a subject</option>
                    {booksStructure.subjects.map(subject => (
                      <option key={subject.slug} value={subject.slug}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Book Chapter Selection */}
                {uploadType === 'book' && selectedSubject && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Book *
                      </label>
                      <select
                        name="book"
                        value={selectedBook}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a book</option>
                        {selectedSubjectData?.books.map(book => (
                          <option key={book.slug} value={book.slug}>
                            {book.title} {book.description && `(${book.description})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedBook && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chapter *
                        </label>
                        <select
                          name="chapter"
                          value={selectedChapter}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select a chapter</option>
                          {selectedBookData?.chapters.map(chapter => (
                            <option key={chapter.slug || chapter.id} value={chapter.slug || chapter.id}>
                              {chapter.title} {chapter.questionCount > 0 && `(${chapter.questionCount} questions)`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* PYQ Session Selection */}
                {uploadType === 'pyq' && selectedSubject && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PYQ Session *
                    </label>
                    <select
                      name="pyqSession"
                      value={selectedPyqSession}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a PYQ session</option>
                      {booksStructure.pyqSessions[selectedSubject]?.map(session => (
                        <option key={session.slug} value={session.slug}>
                          {session.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Upload Path Preview */}
                {uploadPath && (
                  <Card className="p-4 bg-blue-50 border-2 border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-1">Questions will be saved to:</p>
                    <p className="text-xs text-blue-700 font-mono">{uploadPath}</p>
                    {uploadType === 'book' && selectedChapterData && (
                      <p className="text-xs text-blue-600 mt-2">
                        Current questions in this chapter: {selectedChapterData.questionCount || 0}
                      </p>
                    )}
                  </Card>
                )}

                {/* Questions Section */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Questions ({questions.length})
                    </h2>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      + Add Question
                    </button>
                  </div>

                  <div className="space-y-6">
                    {questions.map((question, qIndex) => (
                      <Card key={qIndex} className="p-6 bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Question {qIndex + 1}
                          </h3>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIndex)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {/* Question Text */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question Text *
                          </label>
                          <textarea
                            value={question.question}
                            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Enter the question..."
                            required
                          />
                        </div>

                        {/* Options */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options * (4 options required)
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex}>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Solution */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answer/Solution *
                          </label>
                          <input
                            type="text"
                            value={question.solution}
                            onChange={(e) => handleQuestionChange(qIndex, 'solution', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter the correct answer (must match one of the options)"
                            required
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            The solution should exactly match one of the options above
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 border-t pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubject('');
                      setSelectedBook('');
                      setSelectedChapter('');
                      setSelectedPyqSession('');
                      setQuestions([{
                        question: '',
                        options: ['', '', '', ''],
                        solution: ''
                      }]);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !uploadPath}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Uploading...' : 'Upload Questions'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuestionUpload;
