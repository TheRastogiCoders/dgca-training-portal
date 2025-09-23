import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import AdminSidebar from './admin/AdminSidebar';
import AdminStatsCards from './AdminStatsCards';
import AdminUsers from './admin/AdminUsers';
import AdminLogs from './admin/AdminLogs';
import { API_ENDPOINTS } from '../config/api';

const AdminPanel = () => {
  const { user, isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    file: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notesResponse, subjectsResponse] = await Promise.all([
        fetch(`${API_ENDPOINTS.CONTENT}?type=notes`),
        fetch(`${API_ENDPOINTS.SUBJECTS || '/api/subjects'}`)
      ]);
      
      const notesData = await notesResponse.json();
      const subjectsData = await subjectsResponse.json();
      
      setNotes(notesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('subject', formData.subject);
    uploadData.append('file', formData.file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      if (response.ok) {
        alert('File uploaded successfully!');
        setFormData({ title: '', description: '', subject: '', file: null });
        setShowUploadForm(false);
        fetchData();
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Note deleted successfully!');
        fetchData();
      } else {
        alert('Delete failed. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Manage study materials and custom questions</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link to="/admin-panel" className="card p-4 text-center">
                <div className="font-semibold text-gray-900">Dashboard</div>
                <div className="text-xs text-gray-500">Overview & stats</div>
              </Link>
              <Link to="/admin-questions" className="card p-4 text-center">
                <div className="font-semibold text-gray-900">Questions</div>
                <div className="text-xs text-gray-500">Create & manage</div>
              </Link>
              <a href="#users" className="card p-4 text-center">
                <div className="font-semibold text-gray-900">Users</div>
                <div className="text-xs text-gray-500">Promote, remove</div>
              </a>
              <a href="#logs" className="card p-4 text-center">
                <div className="font-semibold text-gray-900">Logs</div>
                <div className="text-xs text-gray-500">Traffic & requests</div>
              </a>
            </div>

            {/* Upload Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upload New Material</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowUploadForm(!showUploadForm)}
                >
                  {showUploadForm ? 'Cancel' : '+ Upload Material'}
                </button>
              </div>

              {showUploadForm && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <select
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="input-field"
                          required
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(subject => (
                            <option key={subject._id} value={subject._id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows="3"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                        PDF File
                      </label>
                      <input
                        type="file"
                        id="file"
                        accept=".pdf"
                        onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Uploading...
                        </div>
                      ) : (
                        'Upload Material'
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Materials List */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Uploaded Materials</h2>
                <span className="text-gray-600">{notes.length} materials</span>
              </div>

              {notes.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No materials uploaded yet</h3>
                  <p className="text-gray-600">Upload your first study material to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes.map(note => (
                    <div key={note._id} className="card p-6 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-2xl">
                          📄
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{note.title}</h3>
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {note.subject?.name || 'General'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {note.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span>{note.uploadedBy?.username || 'Admin'}</span>
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <a 
                          href={`${note.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 btn btn-secondary text-center"
                        >
                          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </a>
                        <button 
                          onClick={() => handleDelete(note._id)}
                          className="flex-1 btn bg-red-500 hover:bg-red-600 text-white text-center"
                        >
                          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Stats */}
            <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{notes.length}</div>
                  <div className="text-gray-600">Total Materials</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{subjects.length}</div>
                  <div className="text-gray-600">Subjects</div>
                </div>
                <AdminStatsCards />
              </div>
            </div>

            {/* Users Management */}
            <div id="users" className="mt-8 bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Users</h2>
              <AdminUsers />
            </div>

            {/* Logs */}
            <div id="logs" className="mt-8 bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Logs</h2>
              <AdminLogs />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;