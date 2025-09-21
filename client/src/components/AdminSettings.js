import React, { useEffect, useState } from 'react';
import Header from './Header';
import AdminSidebar from './admin/AdminSidebar';

const AdminSettings = () => {
  const [form, setForm] = useState({ adminHost: '', aiEnabled: true, notesMaxMb: 10 });

  useEffect(() => {
    // Preload hints from environment when available (frontend cannot read server env; provide placeholders)
    setForm(f => ({ ...f }));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    alert('Settings are stored on server env and config. Please edit server/.env for ADMIN_HOST and restart the server. For upload size, adjust server/routes/notes.js limits.');
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Settings</h1>
            <form onSubmit={save} className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Host (for production)</label>
                <input className="input-field" placeholder="admin.yourdomain.com" value={form.adminHost} onChange={e => setForm({ ...form, adminHost: e.target.value })} />
                <p className="text-xs text-gray-500 mt-1">Set ADMIN_HOST in server/.env to enforce admin-only host.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Responses</label>
                <select className="input-field" value={form.aiEnabled ? 'on' : 'off'} onChange={e => setForm({ ...form, aiEnabled: e.target.value === 'on' })}>
                  <option value="on">Enabled (fallback when key missing)</option>
                  <option value="off">Disabled</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Toggle client usage. Server still controls real AI via GOOGLE_API_KEY.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Notes File Size (MB)</label>
                <input type="number" min="1" className="input-field" value={form.notesMaxMb} onChange={e => setForm({ ...form, notesMaxMb: Number(e.target.value) })} />
                <p className="text-xs text-gray-500 mt-1">Current server limit is 10 MB in code. Adjust server/routes/notes.js to change.</p>
              </div>
              <div className="flex justify-end">
                <button className="btn btn-primary" type="submit">Save</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;


