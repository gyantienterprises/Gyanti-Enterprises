import React, { useState, useEffect } from 'react';

function AdminDashboard() {
  // --- State Management ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if token exists on load so the admin doesn't have to re-login on refresh
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // --- Fetch Data from Backend (Protected) ---
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      
      // Points to your secure backend endpoint
      const response = await fetch('http://localhost:5000/api/admin/leads', {
        headers: {
          'Authorization': `Bearer ${token}` // Passing the token safely
        }
      }); 

      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        handleLogout();
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) throw new Error('Failed to fetch data from database');
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data immediately when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // --- Handlers ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Send password to server for validation
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const result = await response.json();

      if (response.ok && result.token) {
        localStorage.setItem('adminToken', result.token); // Store token
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Cannot connect to authentication server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setData([]);
  };

  const handleCopy = (phoneNumber) => {
    navigator.clipboard.writeText(phoneNumber);
    alert(`Copied: ${phoneNumber}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this lead?")) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/leads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Seamlessly clear from UI without manual refresh
        setData(data.filter(item => item.id !== id));
      } else {
        const errResult = await response.json();
        alert(errResult.error || 'Failed to delete entry.');
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  // --- 1. Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white p-4">
        <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-400">Enter Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-indigo-500 text-white"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-3 rounded transition duration-200"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. Main Dashboard Screen ---
  return (
    <div className="p-8 bg-gray-950 text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Neon Database Control Panel</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium transition"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading data from Neon...</div>
      ) : error ? (
        <div className="text-red-500 bg-red-950/30 border border-red-900 p-4 rounded mb-6">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 text-sm font-medium">
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/40 transition">
                  <td className="p-4 text-gray-500 font-mono text-sm">{user.id}</td>
                  <td className="p-4 font-medium">{user.name || 'N/A'}</td>
                  <td className="p-4 text-indigo-400 font-mono">{user.phone}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleCopy(user.phone)}
                      className="bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1.5 rounded transition"
                    >
                      Copy
                    </button>
                    <a
                      href={`tel:${user.phone}`}
                      className="inline-block bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs px-3 py-1.5 rounded transition"
                    >
                      Call
                    </a>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white text-xs px-3 py-1.5 rounded transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500">No entries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;