import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminQuestions = () => {
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('study-materials');
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [content, setContent] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [studyForm, setStudyForm] = useState({
    title: '',
    description: '',
    subject: '',
    type: 'notes',
    tags: '',
    difficulty: 'medium'
  });

  const [pdfForm, setPdfForm] = useState({
    title: '',
    description: '',
    subject: '',
    tags: '',
    difficulty: 'medium'
  });

  const [mcqForm, setMcqForm] = useState({
    title: '',
    subject: '',
    book: '',
    tags: '',
    questions: [{ text: '', options: ['', '', '', ''], answer: '', explanation: '', difficulty: 'medium' }]
  });

  // Redirect if not admin authenticated
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [subRes, bookRes, contentRes, mcqRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/books'),
          fetch('/api/content'),
          fetch('/api/mcq')
        ]);
        
        const [subj, bookList, contentList, mcqList] = await Promise.all([
          subRes.json(),
          bookRes.json(),
          contentRes.json(),
          mcqRes.json()
        ]);
        
        setSubjects(Array.isArray(subj) ? subj : []);
        setBooks(Array.isArray(bookList) ? bookList : []);
        setContent(Array.isArray(contentList) ? contentList : []);
        setMcqs(Array.isArray(mcqList) ? mcqList : []);
        
        console.log('📊 Loaded data:', {
          subjects: Array.isArray(subj) ? subj.length : 0,
          books: Array.isArray(bookList) ? bookList.length : 0,
          content: Array.isArray(contentList) ? contentList.length : 0,
          mcqs: Array.isArray(mcqList) ? mcqList.length : 0
        });
      } catch (e) {
        console.error('❌ Error loading data:', e);
        setError('Failed to load data: ' + e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStudyFormChange = (e) => {
    const { name, value } = e.target;
    setStudyForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePdfFormChange = (e) => {
    const { name, value } = e.target;
    setPdfForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMcqFormChange = (e) => {
    const { name, value } = e.target;
    setMcqForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMcqQuestionChange = (questionIndex, field, value) => {
    setMcqForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleMcqOptionChange = (questionIndex, optionIndex, value) => {
    setMcqForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options.map((opt, j) => j === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const addMcqQuestion = () => {
    setMcqForm(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: ['', '', '', ''], answer: '', explanation: '', difficulty: 'medium' }]
    }));
  };

  const removeMcqQuestion = (index) => {
    if (mcqForm.questions.length > 1) {
      setMcqForm(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleStudyUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      const fileInput = document.getElementById('studyFile');
      const file = fileInput.files[0];

      if (!file) {
        setError('Please select a file to upload');
        return;
      }

      formData.append('file', file);
      formData.append('title', studyForm.title);
      formData.append('description', studyForm.description);
      formData.append('subject', studyForm.subject);
      formData.append('type', studyForm.type);
      formData.append('tags', studyForm.tags);
      formData.append('difficulty', studyForm.difficulty);

        const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/content/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      console.log('✅ Study material uploaded:', result.title);
      
      // Reset form
      setStudyForm({
        title: '',
        description: '',
        subject: '',
        type: 'notes',
        tags: '',
        difficulty: 'medium'
      });
      document.getElementById('studyFile').value = '';

      // Refresh content list
      const contentRes = await fetch('/api/content');
      const contentList = await contentRes.json();
      setContent(Array.isArray(contentList) ? contentList : []);

      alert('Study material uploaded successfully!');
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      const fileInput = document.getElementById('pdfFile');
      const file = fileInput.files[0];

      if (!file) {
        setError('Please select a PDF file to upload');
        return;
      }

      formData.append('pdf', file);
      formData.append('title', pdfForm.title);
      formData.append('description', pdfForm.description);
      formData.append('subject', pdfForm.subject);
      formData.append('tags', pdfForm.tags);
      formData.append('difficulty', pdfForm.difficulty);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/content/pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PDF upload failed');
      }

      const result = await response.json();
      console.log('✅ PDF uploaded:', result.title);
      
      // Reset form
      setPdfForm({
        title: '',
        description: '',
      subject: '',
        tags: '',
        difficulty: 'medium'
      });
      document.getElementById('pdfFile').value = '';

      // Refresh content list
      const contentRes = await fetch('/api/content');
      const contentList = await contentRes.json();
      setContent(Array.isArray(contentList) ? contentList : []);

      alert('PDF uploaded successfully!');
    } catch (error) {
      console.error('❌ PDF upload error:', error);
      setError(error.message || 'PDF upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleMcqUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/mcq/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mcqForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'MCQ upload failed');
      }

      const result = await response.json();
      console.log('✅ MCQ uploaded:', result.title);
      
      // Reset form
      setMcqForm({
        title: '',
        subject: '',
        book: '',
        tags: '',
        questions: [{ text: '', options: ['', '', '', ''], answer: '', explanation: '', difficulty: 'medium' }]
      });

      // Refresh MCQ list
      const mcqRes = await fetch('/api/mcq');
      const mcqList = await mcqRes.json();
      setMcqs(Array.isArray(mcqList) ? mcqList : []);

      alert('MCQ questions uploaded successfully!');
    } catch (error) {
      console.error('❌ MCQ upload error:', error);
      setError(error.message || 'MCQ upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteContent = async (id) => {
    if (!window.confirm('Delete this content?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      // Refresh content list
      const contentRes = await fetch('/api/content');
      const contentList = await contentRes.json();
      setContent(Array.isArray(contentList) ? contentList : []);

      alert('Content deleted successfully!');
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Delete failed: ' + error.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'notes': return '📝';
      case 'pdf': return '📄';
      case 'mcq': return '❓';
      default: return '📁';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading content management...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                <Link to="/admin-dashboard" className="text-blue-600 hover:text-blue-700">Dashboard</Link>
                <span className="mx-2">/</span>
                <span>Content Management</span>
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4">
                Content Management
              </h1>
              <p className="text-base md:text-xl text-gray-600">
                Upload and manage study materials, PDFs, and MCQ questions
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Tabs */}
            <div className="mb-6 md:mb-8">
              <div className="grid grid-cols-2 md:flex gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'study-materials', label: 'Study Materials', icon: '📝', shortLabel: 'Study' },
                  { id: 'pdf-uploads', label: 'PDF Analysis', icon: '📄', shortLabel: 'PDF' },
                  { id: 'mcq-uploads', label: 'MCQ Questions', icon: '❓', shortLabel: 'MCQ' },
                  { id: 'manage-content', label: 'Manage Content', icon: '📚', shortLabel: 'Manage' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 md:py-3 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="mr-1 md:mr-2">{tab.icon}</span>
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">{tab.shortLabel}</span>
                  </button>
                ))}
                  </div>
                </div>

            {/* Study Materials Upload */}
            {activeTab === 'study-materials' && (
              <Card className="p-4 md:p-6 mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Upload Study Materials</h3>
                <form onSubmit={handleStudyUpload} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={studyForm.title}
                        onChange={handleStudyFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter material title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <select
                        name="subject"
                        value={studyForm.subject}
                        onChange={handleStudyFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select subject</option>
                        {Array.isArray(subjects) && subjects.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                  </div>
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={studyForm.description}
                      onChange={handleStudyFormChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the study material"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        name="type"
                        value={studyForm.type}
                        onChange={handleStudyFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="notes">Study Notes</option>
                        <option value="mcq">MCQ Set</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                      <select
                        name="difficulty"
                        value={studyForm.difficulty}
                        onChange={handleStudyFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <input
                        type="text"
                        name="tags"
                        value={studyForm.tags}
                        onChange={handleStudyFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tag1, tag2, tag3"
                      />
                  </div>
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                    <input
                      type="file"
                      id="studyFile"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG (Max 50MB)</p>
            </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </div>
                    ) : (
                      'Upload Study Material'
                    )}
                  </button>
                </form>
              </Card>
            )}

            {/* PDF Upload */}
            {activeTab === 'pdf-uploads' && (
              <Card className="p-4 md:p-6 mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Upload PDF for Admin Analysis Questions</h3>
                <form onSubmit={handlePdfUpload} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={pdfForm.title}
                        onChange={handlePdfFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter PDF title"
                        required
                      />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select 
                      name="subject" 
                        value={pdfForm.subject}
                        onChange={handlePdfFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select subject</option>
                        {Array.isArray(subjects) && subjects.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={pdfForm.description}
                      onChange={handlePdfFormChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the PDF content"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                      <select
                        name="difficulty"
                        value={pdfForm.difficulty}
                        onChange={handlePdfFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <input
                        type="text"
                        name="tags"
                        value={pdfForm.tags}
                        onChange={handlePdfFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PDF File Upload</label>
                    <input
                      type="file"
                      id="pdfFile"
                      accept=".pdf"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Only PDF files are allowed (Max 50MB)</p>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Uploading PDF...
                      </div>
                    ) : (
                      'Upload PDF for Analysis'
                    )}
                  </button>
                </form>
              </Card>
            )}

            {/* MCQ Upload */}
            {activeTab === 'mcq-uploads' && (
              <Card className="p-4 md:p-6 mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Upload MCQ Questions</h3>
                <form onSubmit={handleMcqUpload} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={mcqForm.title}
                        onChange={handleMcqFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter MCQ set title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select 
                        name="subject"
                        value={mcqForm.subject}
                        onChange={handleMcqFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required 
                      >
                        <option value="">Select subject</option>
                        {Array.isArray(subjects) && subjects.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Book (Optional)</label>
                      <select
                        name="book"
                        value={mcqForm.book}
                        onChange={handleMcqFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!mcqForm.subject}
                      >
                        <option value="">Select book</option>
                        {Array.isArray(books) && books
                          .filter(b => (b.subject?._id || b.subject) === mcqForm.subject)
                          .map(b => (
                            <option key={b._id} value={b._id}>{b.title}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <input
                        type="text"
                        name="tags"
                        value={mcqForm.tags}
                        onChange={handleMcqFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>

                  {/* Questions */}
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                      <h4 className="text-base md:text-lg font-semibold text-gray-900">Questions</h4>
                      <button
                        type="button"
                        onClick={addMcqQuestion}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        + Add Question
                      </button>
                    </div>

                    <div className="space-y-6">
                      {mcqForm.questions.map((question, qIndex) => (
                        <div key={qIndex} className="p-3 md:p-4 border border-gray-200 rounded-lg">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                            <h5 className="font-medium text-gray-900 text-sm md:text-base">Question {qIndex + 1}</h5>
                            {mcqForm.questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMcqQuestion(qIndex)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                  <textarea 
                                value={question.text}
                                onChange={(e) => handleMcqQuestionChange(qIndex, 'text', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3" 
                                placeholder="Enter the question"
                    required 
                  />
                </div>
                
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center">
                                    <span className="w-6 sm:w-8 text-xs sm:text-sm font-medium text-gray-700">
                                      {String.fromCharCode(65 + oIndex)}.
                                    </span>
                  <input 
                                      type="text"
                                      value={option}
                                      onChange={(e) => handleMcqOptionChange(qIndex, oIndex, e.target.value)}
                                      className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                      placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                    required 
                  />
                                  </div>
                                ))}
                              </div>
                </div>
                
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                    <select 
                                  value={question.answer}
                                  onChange={(e) => handleMcqQuestionChange(qIndex, 'answer', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                                  <option value="">Select correct answer</option>
                                  {question.options.map((opt, oIndex) => (
                                    <option key={oIndex} value={opt}>
                                      {String.fromCharCode(65 + oIndex)}. {opt}
                                    </option>
                      ))}
                    </select>
                  </div>
                  <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                                <select
                                  value={question.difficulty}
                                  onChange={(e) => handleMcqQuestionChange(qIndex, 'difficulty', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="easy">Easy</option>
                                  <option value="medium">Medium</option>
                                  <option value="hard">Hard</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
                              <textarea
                                value={question.explanation}
                                onChange={(e) => handleMcqQuestionChange(qIndex, 'explanation', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="2"
                                placeholder="Explain why this answer is correct"
                    />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                
                <button 
                  type="submit" 
                    disabled={uploading}
                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Uploading MCQ...
                    </div>
                  ) : (
                      'Upload MCQ Questions'
                  )}
                </button>
              </form>
            </Card>
            )}

            {/* Manage Content */}
            {activeTab === 'manage-content' && (
              <div className="space-y-4 md:space-y-6">
                {/* Content List */}
                <Card className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Uploaded Content</h3>
                  
                  {content.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No content uploaded yet</h3>
                      <p className="text-gray-600">Upload study materials, PDFs, or MCQ questions to get started.</p>
                </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {content.map(item => (
                        <div key={item._id} className="p-3 md:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center flex-1 min-w-0">
                              <span className="text-xl md:text-2xl mr-2 md:mr-3 flex-shrink-0">{getTypeIcon(item.type)}</span>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">{item.title}</h4>
                                <p className="text-xs md:text-sm text-gray-600">{item.subject?.name}</p>
                  </div>
                </div>
                            <button
                              onClick={() => deleteContent(item._id)}
                              className="text-red-600 hover:text-red-700 text-xs md:text-sm flex-shrink-0 ml-2"
                            >
                              Delete
                            </button>
                </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                              {item.difficulty}
                            </span>
                            <span className="text-gray-500">
                              {item.fileSize ? formatFileSize(item.fileSize) : 'N/A'}
                            </span>
                          </div>

                          <div className="mt-3">
                            <a
                              href={`/api/content/${item._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View Content →
                            </a>
                  </div>
                              </div>
                            ))}
                          </div>
                  )}
                </Card>

                {/* MCQ List */}
                <Card className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Uploaded MCQ Sets</h3>
                  
                  {mcqs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">❓</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No MCQ sets uploaded yet</h3>
                      <p className="text-gray-600">Upload MCQ question sets to get started.</p>
                </div>
              ) : (
                    <div className="space-y-3 md:space-y-4">
                      {mcqs.map(mcq => (
                        <div key={mcq._id} className="p-3 md:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base truncate">{mcq.title}</h4>
                              <p className="text-xs md:text-sm text-gray-600 mb-2">
                                {mcq.subject?.name} • {mcq.book?.title || 'No book'} • {mcq.questions.length} questions
                              </p>
                              {mcq.tags && mcq.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {mcq.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                            </div>
                          )}
                        </div>
                            <div className="text-xs md:text-sm text-gray-500 flex-shrink-0">
                              {new Date(mcq.createdAt).toLocaleDateString()}
                            </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
                </Card>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminQuestions;
