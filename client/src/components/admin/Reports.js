import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SiteSidebar from '../SiteSidebar';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { API_ENDPOINTS } from '../../config/api';

const Reports = () => {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingReport, setDeletingReport] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [editFormData, setEditFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: '',
    solution: '',
    explanation: ''
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !isAdmin()) {
      navigate('/login');
      return;
    }

    fetchReports();
  }, [isAuthenticated, authLoading, navigate, statusFilter, searchQuery, page]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`${API_ENDPOINTS.REPORTS}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch reports' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setReports(data.reports || []);
      setTotalPages(data.pages || 1);
      setTotalReports(data.total || 0);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      setUpdatingStatus(reportId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.REPORTS}/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update status' }));
        throw new Error(errorData.message || 'Failed to update status');
      }

      // Refresh reports
      await fetchReports();
      
      // Close details modal if open
      if (selectedReport && selectedReport._id === reportId) {
        setShowDetailsModal(false);
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.message || 'Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingReport(reportId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.REPORTS}/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete report' }));
        throw new Error(errorData.message || 'Failed to delete report');
      }

      // Refresh reports
      await fetchReports();
      
      // Close details modal if open
      if (selectedReport && selectedReport._id === reportId) {
        setShowDetailsModal(false);
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      alert(err.message || 'Failed to delete report. Please try again.');
    } finally {
      setDeletingReport(null);
    }
  };

  const handleViewDetails = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.REPORTS}/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report details');
      }

      const data = await response.json();
      setSelectedReport(data.report);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching report details:', err);
      alert('Failed to load report details. Please try again.');
    }
  };

  const handleEditQuestion = async (report) => {
    try {
      setLoadingQuestion(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Build query params
      const params = new URLSearchParams({ questionId: report.questionId });
      if (report.bookSlug && report.bookSlug.trim()) {
        params.append('bookSlug', report.bookSlug.trim());
      }
      if (report.chapterSlug && report.chapterSlug.trim()) {
        params.append('chapterSlug', report.chapterSlug.trim());
      }

      console.log('[Reports] Loading question:', {
        questionId: report.questionId,
        bookSlug: report.bookSlug,
        chapterSlug: report.chapterSlug,
        url: `${API_ENDPOINTS.ADMIN_FIND_QUESTION}?${params.toString()}`
      });

      const response = await fetch(`${API_ENDPOINTS.ADMIN_FIND_QUESTION}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to load question' }));
        const errorMessage = errorData.message || `Failed to load question (${response.status})`;
        console.error('[Reports] Error loading question:', errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const question = data.question;

      // Normalize question data to form format
      let questionText = question.question || question.question_text || question.text || '';
      let options = [];
      
      if (Array.isArray(question.options)) {
        options = [...question.options];
      } else if (typeof question.options === 'object' && question.options !== null) {
        // Convert object to array (e.g., {A: "option1", B: "option2"})
        options = Object.values(question.options);
      }
      
      // Ensure at least 4 options
      while (options.length < 4) {
        options.push('');
      }

      let answer = question.answer || question.correctAnswer || question.correct_answer || '';
      let solution = question.solution || answer;
      let explanation = question.explanation || '';

      setEditFormData({
        question: questionText,
        options: options.slice(0, 4),
        answer: answer,
        solution: solution,
        explanation: explanation
      });

      setEditingQuestion({
        ...data,
        reportId: report._id
      });
      setShowEditModal(true);
    } catch (err) {
      console.error('Error loading question:', err);
      alert(err.message || 'Failed to load question. The question may not exist in the database.');
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      if (!editingQuestion) return;

      // Validation
      if (!editFormData.question.trim()) {
        alert('Question text is required');
        return;
      }

      const validOptions = editFormData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        alert('At least 2 options are required');
        return;
      }

      if (!editFormData.answer.trim()) {
        alert('Answer is required');
        return;
      }

      setSavingQuestion(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Find the report to get bookSlug and chapterSlug
      const report = reports.find(r => r._id === editingQuestion.reportId);
      
      const payload = {
        questionId: report?.questionId || editingQuestion.questionId,
        bookSlug: report?.bookSlug || editingQuestion.bookSlug,
        chapterSlug: report?.chapterSlug || editingQuestion.chapterSlug,
        question: {
          question: editFormData.question.trim(),
          question_text: editFormData.question.trim(),
          options: validOptions,
          answer: editFormData.answer.trim(),
          solution: editFormData.solution.trim() || editFormData.answer.trim(),
          explanation: editFormData.explanation.trim() || ''
        }
      };

      const response = await fetch(API_ENDPOINTS.ADMIN_UPDATE_QUESTION, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update question' }));
        throw new Error(errorData.message || 'Failed to update question');
      }

      const result = await response.json();
      
      alert('Question updated successfully!');
      
      // Optionally update report status to resolved
      if (report && report.status !== 'resolved') {
        await handleStatusUpdate(report._id, 'resolved');
      }
      
      // Close modal
      setShowEditModal(false);
      setEditingQuestion(null);
      setEditFormData({
        question: '',
        options: ['', '', '', ''],
        answer: '',
        solution: '',
        explanation: ''
      });
    } catch (err) {
      console.error('Error saving question:', err);
      alert(err.message || 'Failed to save question. Please try again.');
    } finally {
      setSavingQuestion(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getReportTypeBadgeClass = (type) => {
    switch (type) {
      case 'Wrong Answer':
        return 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-800 border-2 border-rose-300 shadow-sm hover:shadow-md transition-shadow';
      case 'Incorrect Question':
        return 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-2 border-amber-300 shadow-sm hover:shadow-md transition-shadow';
      case 'Formatting Issue':
        return 'bg-gradient-to-r from-violet-50 to-violet-100 text-violet-800 border-2 border-violet-300 shadow-sm hover:shadow-md transition-shadow';
      case 'Missing Data':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-2 border-yellow-300 shadow-sm hover:shadow-md transition-shadow';
      case 'Other':
        return 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 border-2 border-slate-300 shadow-sm hover:shadow-md transition-shadow';
      default:
        return 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 border-2 border-slate-300 shadow-sm hover:shadow-md transition-shadow';
    }
  };

  const getInitials = (nameOrEmail = '') => {
    if (!nameOrEmail) return '?';
    const base = nameOrEmail.replace(/@.*/, '');
    const parts = base.split(/[\s._-]+/).filter(Boolean);
    if (parts.length === 0) return base[0]?.toUpperCase() || '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] via-[#f3f6fb] to-[#eef2f8]">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-lg">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
                <p className="text-slate-600 font-semibold">Loading reports...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] via-[#f3f6fb] to-[#eef2f8] text-slate-900">
      <div className="flex">
        <SiteSidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-slate-100 shadow-sm w-fit">
                <span className="text-blue-600 text-sm font-semibold">Reports</span>
                <span className="text-xs text-slate-500">Insights & actions</span>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Question Reports</h1>
                <p className="text-slate-600 text-sm md:text-base">Review, resolve, or dismiss issues raised by users—optimized for clarity and speed.</p>
              </div>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6 p-5 md:p-6 bg-white/80 backdrop-blur-sm border border-slate-100 shadow-md rounded-2xl">
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Search Reports
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M9.5 17a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search by question ID, text, or reporter..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm"
                    />
                  </div>
                </div>
                <div className="md:w-56">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Filter by Status
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10m-8 6h6" />
                      </svg>
                    </span>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 shadow-sm appearance-none"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-2.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 shadow-md hover:shadow-lg transition-shadow rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Total Reports</span>
                  <span className="text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6l4 2" />
                    </svg>
                  </span>
                </div>
                <div className="text-3xl font-bold text-blue-700">{totalReports}</div>
              </Card>
              <Card className="p-5 md:p-6 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-100 shadow-md hover:shadow-lg transition-shadow rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pending</span>
                  <span className="text-amber-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l2.5 2.5" />
                    </svg>
                  </span>
                </div>
                <div className="text-3xl font-bold text-amber-700">
                  {reports.filter(r => r.status === 'pending').length}
                </div>
              </Card>
              <Card className="p-5 md:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-100 shadow-md hover:shadow-lg transition-shadow rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Resolved</span>
                  <span className="text-emerald-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>
                <div className="text-3xl font-bold text-emerald-700">
                  {reports.filter(r => r.status === 'resolved').length}
                </div>
              </Card>
              <Card className="p-5 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 shadow-md hover:shadow-lg transition-shadow rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">Dismissed</span>
                  <span className="text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-700">
                  {reports.filter(r => r.status === 'dismissed').length}
                </div>
              </Card>
            </div>

            {/* Error Message */}
            {error && (
              <Card className="mb-6 p-4 bg-red-50 border-2 border-red-200">
                <p className="text-red-700 font-medium">{error}</p>
              </Card>
            )}

            {/* Reports Table */}
            <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl rounded-3xl">
              {reports.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">No reports found</p>
                  <p className="text-sm text-gray-500">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Reports will appear here when users submit them'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="overflow-x-auto hidden md:block">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider">Question ID</th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider min-w-[140px]">Type</th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider min-w-[180px]">Reporter</th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider min-w-[100px]">Status</th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider min-w-[160px]">Date</th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider min-w-[280px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {reports.map((report) => {
                          const reporterName = report.reportedBy?.username || report.reporterName || report.reporterEmail || 'Anonymous';
                          const reporterEmail = report.reportedBy?.email || report.reporterEmail || '';

                          return (
                            <tr key={report._id} className="hover:bg-blue-50/40 transition-colors border-b border-slate-100">
                              <td className="px-6 py-5 text-sm align-middle">
                                <div className="font-mono text-xs text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 inline-block shadow-sm max-w-xs truncate">
                                  {report.questionId || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-5 align-middle">
                                <span className={`inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap min-w-[120px] ${getReportTypeBadgeClass(report.reportType)}`}>
                                  {report.reportType}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-sm align-middle">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 text-blue-900 flex items-center justify-center text-xs font-bold shadow-md border-2 border-white/80 flex-shrink-0">
                                    {getInitials(reporterName)}
                                  </div>
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                      {reporterName}
                                    </div>
                                    {reporterEmail && (
                                      <div className="text-xs text-gray-500 truncate">{reporterEmail}</div>
                                    )}
                                    {!reporterEmail && reporterName === 'Anonymous' && (
                                      <div className="text-xs text-gray-400 italic">No reporter info provided</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 align-middle">
                                <span className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-full border-2 ${getStatusBadgeClass(report.status)} shadow-sm min-w-[90px]`}>
                                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-sm text-gray-600 align-middle whitespace-nowrap">
                                {formatDate(report.createdAt)}
                              </td>
                              <td className="px-6 py-5 align-middle">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => handleViewDetails(report._id)}
                                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors border border-blue-200 shadow-sm"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleEditQuestion(report)}
                                    disabled={loadingQuestion}
                                    className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                  >
                                    {loadingQuestion ? 'Loading...' : 'Edit'}
                                  </button>
                                  {report.status !== 'resolved' && (
                                    <button
                                      onClick={() => handleStatusUpdate(report._id, 'resolved')}
                                      disabled={updatingStatus === report._id}
                                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                      {updatingStatus === report._id ? 'Updating...' : 'Resolve'}
                                    </button>
                                  )}
                                  {report.status !== 'dismissed' && (
                                    <button
                                      onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                                      disabled={updatingStatus === report._id}
                                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                      {updatingStatus === report._id ? 'Updating...' : 'Dismiss'}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteReport(report._id)}
                                    disabled={deletingReport === report._id}
                                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors border border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                  >
                                    {deletingReport === report._id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card list */}
                  <div className="grid gap-4 md:hidden px-3 py-4">
                    {reports.map((report) => {
                      const reporterName = report.reportedBy?.username || report.reporterName || report.reporterEmail || 'Anonymous';
                      const reporterEmail = report.reportedBy?.email || report.reporterEmail || '';
                      return (
                        <div
                          key={report._id}
                          className="rounded-2xl border border-gray-200 bg-white/90 shadow-sm p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Question ID</div>
                              <div className="font-mono text-sm text-gray-900 break-all">{report.questionId || 'N/A'}</div>
                            </div>
                            <span className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap flex-shrink-0 ${getReportTypeBadgeClass(report.reportType)}`}>
                              {report.reportType}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 text-blue-900 flex items-center justify-center text-xs font-bold shadow-inner border border-white/60">
                              {getInitials(reporterName)}
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-sm font-semibold text-gray-900">{reporterName}</div>
                              {reporterEmail ? (
                                <div className="text-xs text-gray-500">{reporterEmail}</div>
                              ) : (
                                reporterName === 'Anonymous' && (
                                  <div className="text-xs text-gray-400 italic">No reporter info provided</div>
                                )
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">Status:</span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(report.status)}`}>
                              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </span>
                          </div>

                          <div className="text-xs text-gray-600">
                            {formatDate(report.createdAt)}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleViewDetails(report._id)}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 shadow-sm flex-1 text-center"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditQuestion(report)}
                              disabled={loadingQuestion}
                              className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-1 text-center"
                            >
                              {loadingQuestion ? 'Loading...' : 'Edit'}
                            </button>
                            {report.status !== 'resolved' && (
                              <button
                                onClick={() => handleStatusUpdate(report._id, 'resolved')}
                                disabled={updatingStatus === report._id}
                                className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-1 text-center"
                              >
                                {updatingStatus === report._id ? 'Updating...' : 'Resolve'}
                              </button>
                            )}
                            {report.status !== 'dismissed' && (
                              <button
                                onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                                disabled={updatingStatus === report._id}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-1 text-center"
                              >
                                {updatingStatus === report._id ? 'Updating...' : 'Dismiss'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReport(report._id)}
                              disabled={deletingReport === report._id}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-1 text-center"
                            >
                              {deletingReport === report._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm font-medium text-gray-700">
                        Showing page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span> ({totalReports} total reports)
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
                        >
                          ← Previous
                        </button>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </main>
      </div>

      {/* Report Details Modal */}
      <Modal
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedReport(null);
        }}
        title="Report Details"
      >
        {selectedReport && (
          <div className="space-y-4 sm:space-y-5 pb-2">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Question ID</label>
              <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg border-2 border-gray-200 font-mono text-xs sm:text-sm text-gray-900 break-all">
                {selectedReport.questionId || 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Question Text</label>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-200 text-xs sm:text-sm whitespace-pre-wrap text-gray-900 max-h-40 sm:max-h-48 overflow-y-auto">
                {selectedReport.questionText || 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Report Type</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-full whitespace-nowrap ${getReportTypeBadgeClass(selectedReport.reportType)}`}>
                    {selectedReport.reportType}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold rounded-full border-2 ${getStatusBadgeClass(selectedReport.status)}`}>
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {selectedReport.bookSlug && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Book</label>
                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg border-2 border-gray-200 text-xs sm:text-sm text-gray-900 break-all">
                  {selectedReport.bookSlug}
                </div>
              </div>
            )}

            {selectedReport.chapterSlug && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Chapter</label>
                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg border-2 border-gray-200 text-xs sm:text-sm text-gray-900 break-all">
                  {selectedReport.chapterSlug}
                </div>
              </div>
            )}

            {selectedReport.comment && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Additional Comments</label>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-200 text-xs sm:text-sm whitespace-pre-wrap text-gray-900 max-h-28 sm:max-h-32 overflow-y-auto">
                  {selectedReport.comment}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Reporter</label>
                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg border-2 border-gray-200 text-xs sm:text-sm">
                {selectedReport.reportedBy || selectedReport.reporterName ? (
                    <div>
                    <div className="font-semibold text-gray-900 break-words">
                      {selectedReport.reportedBy?.username || selectedReport.reporterName || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 break-all">
                      {selectedReport.reportedBy?.email || selectedReport.reporterEmail || ''}
                    </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Anonymous</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Reported At</label>
                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg border-2 border-gray-200 text-xs sm:text-sm text-gray-900">
                  {formatDate(selectedReport.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:gap-3 pt-4 sm:pt-5 border-t-2 border-gray-200 pb-1">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditQuestion(selectedReport);
                }}
                disabled={loadingQuestion}
                className="w-full px-4 py-3 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg min-h-[44px] flex items-center justify-center whitespace-nowrap"
              >
                {loadingQuestion ? 'Loading...' : 'Edit Question'}
              </button>
              {selectedReport.status !== 'resolved' && (
                <button
                  onClick={() => handleStatusUpdate(selectedReport._id, 'resolved')}
                  disabled={updatingStatus === selectedReport._id}
                  className="w-full px-4 py-3 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg min-h-[44px] flex items-center justify-center whitespace-nowrap"
                >
                  {updatingStatus === selectedReport._id ? 'Updating...' : 'Mark as Resolved'}
                </button>
              )}
              {selectedReport.status !== 'dismissed' && (
                <button
                  onClick={() => handleStatusUpdate(selectedReport._id, 'dismissed')}
                  disabled={updatingStatus === selectedReport._id}
                  className="w-full px-4 py-3 text-sm sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg min-h-[44px] flex items-center justify-center whitespace-nowrap"
                >
                  {updatingStatus === selectedReport._id ? 'Updating...' : 'Dismiss'}
                </button>
              )}
              <button
                onClick={() => handleDeleteReport(selectedReport._id)}
                disabled={deletingReport === selectedReport._id}
                className="w-full px-4 py-3 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg min-h-[44px] flex items-center justify-center whitespace-nowrap"
              >
                {deletingReport === selectedReport._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Question Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingQuestion(null);
          setEditFormData({
            question: '',
            options: ['', '', '', ''],
            answer: '',
            solution: '',
            explanation: ''
          });
        }}
        title="Edit Question"
      >
        {editingQuestion && (
          <div className="space-y-4 sm:space-y-5 pb-2">
            {loadingQuestion ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading question...</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
                  <div className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">Question Location</div>
                  <div className="text-xs sm:text-sm text-blue-900 space-y-1">
                    <div><span className="font-medium">File:</span> {editingQuestion.filePath?.split(/[/\\]/).pop() || 'N/A'}</div>
                    {editingQuestion.bookName && (
                      <div><span className="font-medium">Book:</span> {editingQuestion.bookName}</div>
                    )}
                    {editingQuestion.chapterTitle && (
                      <div><span className="font-medium">Chapter:</span> {editingQuestion.chapterTitle}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editFormData.question}
                    onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                    rows={4}
                    placeholder="Enter question text..."
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Options <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2 sm:space-y-3">
                    {editFormData.options.map((option, index) => (
                      <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg font-semibold text-gray-700 text-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...editFormData.options];
                              newOptions[index] = e.target.value;
                              setEditFormData({ ...editFormData, options: newOptions });
                            }}
                            className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          />
                        </div>
                        {index >= 2 && (
                          <button
                            onClick={() => {
                              const newOptions = editFormData.options.filter((_, i) => i !== index);
                              setEditFormData({ ...editFormData, options: newOptions });
                            }}
                            className="px-3 sm:px-4 py-2 text-sm sm:text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium whitespace-nowrap sm:w-auto w-full sm:flex-shrink-0"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {editFormData.options.length < 6 && (
                      <button
                        onClick={() => {
                          setEditFormData({
                            ...editFormData,
                            options: [...editFormData.options, '']
                          });
                        }}
                        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-600 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Correct Answer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editFormData.answer}
                      onChange={(e) => setEditFormData({ ...editFormData, answer: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value="">Select answer</option>
                      {editFormData.options.map((opt, index) => (
                        opt.trim() && (
                          <option key={index} value={String.fromCharCode(65 + index).toLowerCase()}>
                            {String.fromCharCode(65 + index)}: {opt.substring(0, 50)}{opt.length > 50 ? '...' : ''}
                          </option>
                        )
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Solution
                    </label>
                    <input
                      type="text"
                      value={editFormData.solution}
                      onChange={(e) => setEditFormData({ ...editFormData, solution: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Solution (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Explanation
                  </label>
                  <textarea
                    value={editFormData.explanation}
                    onChange={(e) => setEditFormData({ ...editFormData, explanation: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                    rows={3}
                    placeholder="Enter explanation (optional)..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-4 border-t-2 border-gray-200 pb-1">
                  <button
                    onClick={handleSaveQuestion}
                    disabled={savingQuestion || !editFormData.question.trim() || !editFormData.answer.trim()}
                    className="w-full sm:flex-1 px-4 py-3 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg min-h-[44px] flex items-center justify-center whitespace-nowrap"
                  >
                    {savingQuestion ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingQuestion(null);
                      setEditFormData({
                        question: '',
                        options: ['', '', '', ''],
                        answer: '',
                        solution: '',
                        explanation: ''
                      });
                    }}
                    className="w-full sm:w-auto sm:flex-1 px-4 py-3 text-sm sm:text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium min-h-[44px] flex items-center justify-center whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;

