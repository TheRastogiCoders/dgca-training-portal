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
        return 'bg-red-100 text-red-800';
      case 'Incorrect Question':
        return 'bg-orange-100 text-orange-800';
      case 'Formatting Issue':
        return 'bg-purple-100 text-purple-800';
      case 'Missing Data':
        return 'bg-indigo-100 text-indigo-800';
      case 'Other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading reports...</p>
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
        <SiteSidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Question Reports
              </h1>
              <p className="text-gray-600">
                Manage and review reported questions from users
              </p>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6 p-6 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Reports
                  </label>
                  <input
                    type="text"
                    placeholder="Search by question ID or text..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div className="md:w-56">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-sm font-medium text-gray-700 mb-2">Total Reports</div>
                <div className="text-3xl font-bold text-blue-600">{totalReports}</div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-sm font-medium text-gray-700 mb-2">Pending</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'pending').length}
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-sm font-medium text-gray-700 mb-2">Resolved</div>
                <div className="text-3xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'resolved').length}
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-sm font-medium text-gray-700 mb-2">Dismissed</div>
                <div className="text-3xl font-bold text-gray-600">
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
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md">
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Question ID</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reporter</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reports.map((report) => {
                          const reporterName = report.reportedBy?.username || report.reporterName || report.reporterEmail || 'Anonymous';
                          const reporterEmail = report.reportedBy?.email || report.reporterEmail || '';

                          return (
                            <tr key={report._id} className="hover:bg-blue-50/60 transition-colors">
                              <td className="px-6 py-4 text-sm align-top">
                                <div className="font-mono text-xs text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block shadow-sm">
                                  {report.questionId || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 align-top">
                                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getReportTypeBadgeClass(report.reportType)}`}>
                                  {report.reportType}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm align-top">
                                <div className="flex items-start gap-3">
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 text-blue-900 flex items-center justify-center text-xs font-bold shadow-inner border border-white/60">
                                    {getInitials(reporterName)}
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {reporterName}
                                    </div>
                                    {reporterEmail && (
                                      <div className="text-xs text-gray-500">{reporterEmail}</div>
                                    )}
                                    {!reporterEmail && reporterName === 'Anonymous' && (
                                      <div className="text-xs text-gray-400 italic">No reporter info provided</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 align-top">
                                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 ${getStatusBadgeClass(report.status)}`}>
                                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 align-top">
                                {formatDate(report.createdAt)}
                              </td>
                              <td className="px-6 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => handleViewDetails(report._id)}
                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 shadow-sm"
                                  >
                                    View
                                  </button>
                                  {report.status !== 'resolved' && (
                                    <button
                                      onClick={() => handleStatusUpdate(report._id, 'resolved')}
                                      disabled={updatingStatus === report._id}
                                      className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                      {updatingStatus === report._id ? 'Updating...' : 'Resolve'}
                                    </button>
                                  )}
                                  {report.status !== 'dismissed' && (
                                    <button
                                      onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                                      disabled={updatingStatus === report._id}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                      {updatingStatus === report._id ? 'Updating...' : 'Dismiss'}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteReport(report._id)}
                                    disabled={deletingReport === report._id}
                                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Question ID</label>
              <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200 font-mono text-sm text-gray-900">
                {selectedReport.questionId || 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 text-sm whitespace-pre-wrap text-gray-900 max-h-48 overflow-y-auto">
                {selectedReport.questionText || 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
                <div className="mt-1">
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getReportTypeBadgeClass(selectedReport.reportType)}`}>
                    {selectedReport.reportType}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="mt-1">
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 ${getStatusBadgeClass(selectedReport.status)}`}>
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {selectedReport.bookSlug && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Book</label>
                <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200 text-sm text-gray-900">
                  {selectedReport.bookSlug}
                </div>
              </div>
            )}

            {selectedReport.chapterSlug && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chapter</label>
                <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200 text-sm text-gray-900">
                  {selectedReport.chapterSlug}
                </div>
              </div>
            )}

            {selectedReport.comment && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Comments</label>
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 text-sm whitespace-pre-wrap text-gray-900 max-h-32 overflow-y-auto">
                  {selectedReport.comment}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reporter</label>
                <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200 text-sm">
                {selectedReport.reportedBy || selectedReport.reporterName ? (
                    <div>
                    <div className="font-semibold text-gray-900">
                      {selectedReport.reportedBy?.username || selectedReport.reporterName || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedReport.reportedBy?.email || selectedReport.reporterEmail || ''}
                    </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Anonymous</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reported At</label>
                <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200 text-sm text-gray-900">
                  {formatDate(selectedReport.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-5 border-t-2 border-gray-200">
              {selectedReport.status !== 'resolved' && (
                <button
                  onClick={() => handleStatusUpdate(selectedReport._id, 'resolved')}
                  disabled={updatingStatus === selectedReport._id}
                  className="flex-1 min-w-[140px] px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  {updatingStatus === selectedReport._id ? 'Updating...' : 'Mark as Resolved'}
                </button>
              )}
              {selectedReport.status !== 'dismissed' && (
                <button
                  onClick={() => handleStatusUpdate(selectedReport._id, 'dismissed')}
                  disabled={updatingStatus === selectedReport._id}
                  className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  {updatingStatus === selectedReport._id ? 'Updating...' : 'Dismiss'}
                </button>
              )}
              <button
                onClick={() => handleDeleteReport(selectedReport._id)}
                disabled={deletingReport === selectedReport._id}
                className="flex-1 min-w-[140px] px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
              >
                {deletingReport === selectedReport._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;

