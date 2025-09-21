import React, { useEffect, useState } from 'react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Pagination from '../ui/Pagination';

const AdminLogs = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', String(limit));
      if (q) params.set('q', q);
      if (method) params.set('method', method);
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/logs?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setItems(data.items || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return (
    <div>
      <Card className="p-4 mb-4">
        <CardHeader title="Request Logs" subtitle="Search API activity" actions={<Button variant="outline" onClick={() => load(1)}>Refresh</Button>} />
        <div className="flex items-end gap-2 mb-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Search</label>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="URL or method" className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="input-field">
              <option value="">All</option>
              {['GET','POST','PUT','DELETE','PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Status</label>
            <input type="number" value={status} onChange={e => setStatus(e.target.value)} placeholder="e.g. 200" className="input-field w-28" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Page size</label>
            <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="input-field">
              {[10,20,50,100,200].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <Button variant="secondary" className="h-10" onClick={() => load(1)}>Apply</Button>
        </div>
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : (
          <div>
            <div className="space-y-2">
              {items.map((l, i) => (
                <div key={l._id || i} className="p-3 border rounded">
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-mono px-2 py-0.5 bg-gray-100 rounded mr-2">{l.method}</span>
                      <span className="text-gray-700">{l.url}</span>
                    </div>
                    <div className="text-gray-500">{new Date(l.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Status {l.status} • {l.responseMs} ms • {l.userId ? 'user ' + l.userId : 'guest'}
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} pages={pages} onChange={(p) => load(p)} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminLogs;


