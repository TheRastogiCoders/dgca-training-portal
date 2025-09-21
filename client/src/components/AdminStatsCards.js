import React, { useEffect, useState } from 'react';

const AdminStatsCards = () => {
  const [stats, setStats] = useState({ users: 0, logs: 0, results: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setStats(data);
      } catch (e) {}
    };
    load();
  }, []);

  return (
    <>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">{stats.users}</div>
        <div className="text-gray-600">Users</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-purple-600 mb-2">{stats.logs}</div>
        <div className="text-gray-600">Requests Logged</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-green-600 mb-2">{stats.results}</div>
        <div className="text-gray-600">Results</div>
      </div>
    </>
  );
};

export default AdminStatsCards;


