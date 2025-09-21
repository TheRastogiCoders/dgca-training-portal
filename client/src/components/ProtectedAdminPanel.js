import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedAdminPanel = () => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subject: '',
    file: null
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and is admin
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/admin');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!parsedUser.isAdmin) {
      navigate('/admin');
      return;
    }

    setUser(parsedUser);
    fetchNotes();
    fetchSubjects();
  }, [navigate]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleFileChange = (e) => {
    setUploadForm({
      ...uploadForm,
      file: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('subject', uploadForm.subject);
    formData.append('file', uploadForm.file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert('File uploaded successfully!');
        setUploadForm({ title: '', description: '', subject: '', file: null });
        setShowUploadForm(false);
        fetchNotes();
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const deleteNote = async (noteId) => {
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
        fetchNotes();
      } else {
        alert('Delete failed. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {/* Admin Header */}
      <div className="admin-header-bar">
        <div className="admin-header-content">
          <div className="admin-welcome">
            <h2>Welcome, {user.username}</h2>
            <span className="admin-badge">ADMIN</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Admin Sidebar */}
        <nav className="admin-sidebar">
          <div className="admin-logo-section">
            <img
              src="/vimaanna-logo.png"
              alt="VIMAANNA Logo"
              className="admin-logo-image"
            />
            <h3>Admin Panel</h3>
          </div>

          <div className="admin-nav-section">
            <div className="admin-nav-item active">
              <div className="admin-nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </div>
              <span>Content Management</span>
            </div>
            <div className="admin-nav-item">
              <div className="admin-nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                </svg>
              </div>
              <span>User Management</span>
            </div>
            <div className="admin-nav-item">
              <div className="admin-nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"/>
                </svg>
              </div>
              <span>Analytics</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <div className="admin-container">
            <div className="admin-header">
              <h1 className="admin-title">Content Management</h1>
              <p className="admin-subtitle">Upload and manage study materials</p>
              <button 
                className="upload-btn"
                onClick={() => setShowUploadForm(true)}
              >
                + Upload New Content
              </button>
            </div>

            {/* Upload Form Modal */}
            {showUploadForm && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>Upload New Content</h2>
                    <button 
                      className="close-btn"
                      onClick={() => setShowUploadForm(false)}
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="upload-form">
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Subject</label>
                      <select
                        value={uploadForm.subject}
                        onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
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
                    <div className="form-group">
                      <label>File (PDF)</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        required
                      />
                    </div>
                    <div className="form-actions">
                      <button type="button" onClick={() => setShowUploadForm(false)}>
                        Cancel
                      </button>
                      <button type="submit">Upload</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="notes-section">
              <h2>Uploaded Content ({notes.length})</h2>
              <div className="notes-grid">
                {notes.map(note => (
                  <div key={note._id} className="note-card">
                    <div className="note-header">
                      <h3>{note.title}</h3>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteNote(note._id)}
                      >
                        Delete
                      </button>
                    </div>
                    <p className="note-description">{note.description}</p>
                    <div className="note-meta">
                      <span>Subject: {note.subject?.name || 'N/A'}</span>
                      <span>Uploaded: {new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <a 
                      href={`${note.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      Download PDF
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProtectedAdminPanel;
