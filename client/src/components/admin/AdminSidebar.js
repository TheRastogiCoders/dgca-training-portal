import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Item = ({ to, icon, title, subtitle }) => {
  const location = useLocation();
  const active = location.pathname.startsWith(to);
  return (
    <Link to={to} className={`block rounded-2xl border transition-all duration-200 p-4 ${active ? 'bg-white shadow-md border-blue-200' : 'bg-white/80 hover:bg-white border-gray-200 hover:shadow'} `}>
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-blue-600 text-white' : 'bg-gray-800/90 text-white'}`}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          {subtitle && <div className="text-xs text-gray-500 leading-tight">{subtitle}</div>}
        </div>
      </div>
    </Link>
  );
};

const AdminSidebar = () => {
  return (
    <nav className="w-72 bg-transparent min-h-screen sticky top-16 hidden md:block">
      <div className="p-6 space-y-4">
        <Item to="/admin-questions" title="Admin Questions" subtitle="Create & manage" icon={<span>❗</span>} />
        
        <Item to="/admin-dashboard" title="Dashboard" subtitle="Users • Logs • Stats" icon={<span>📊</span>} />
        <Item to="/admin-results" title="Results" subtitle="History & filters" icon={<span>📈</span>} />
        <Item to="/admin-settings" title="Settings" subtitle="App & security" icon={<span>⚙️</span>} />
        <Item to="/admin/users" title="Users" subtitle="Manage roles" icon={<span>👤</span>} />
        <Item to="/admin/logs" title="Logs" subtitle="Search & filter" icon={<span>🧾</span>} />
      </div>
    </nav>
  );
};

export default AdminSidebar;


