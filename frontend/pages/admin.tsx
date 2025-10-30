import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';

export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [creditsToAdd, setCreditsToAdd] = useState('100');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users);
    } catch (error: any) {
      console.error('Failed to load admin data:', error);
      if (error.response?.status === 403) {
        setMessage('❌ Access denied. Admin privileges required.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setProcessing(true);

    try {
      const response = await api.post('/api/admin/credits/add', {
        user_email: selectedEmail,
        credits: parseInt(creditsToAdd),
        description: 'Credits added via admin panel',
      });

      setMessage(`✅ ${response.data.message}`);
      loadData(); // Reload data
    } catch (error: any) {
      setMessage(`❌ ${error.response?.data?.detail || 'Failed to add credits'}`);
    } finally {
      setProcessing(false);
    }
  };

  const quickAddCredits = async (email: string, amount: number) => {
    setProcessing(true);
    setMessage('');

    try {
      const response = await api.post('/api/admin/credits/add', {
        user_email: email,
        credits: amount,
        description: `Quick add ${amount} credits`,
      });

      setMessage(`✅ Added ${amount} credits to ${email}`);
      loadData();
    } catch (error: any) {
      setMessage(`❌ ${error.response?.data?.detail || 'Failed to add credits'}`);
    } finally {
      setProcessing(false);
    }
  };

  if (user?.email !== 'mihirbhut07@gmail.com') {
    return (
      <DashboardLayout>
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-1 text-gray-600">Manage users and system settings</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.startsWith('✅')
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* System Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-blue-50">
              <p className="text-sm font-medium text-blue-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total_users}</p>
            </div>
            <div className="card bg-green-50">
              <p className="text-sm font-medium text-green-600">Total Bots</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.total_bots}</p>
            </div>
            <div className="card bg-purple-50">
              <p className="text-sm font-medium text-purple-600">Active Bots</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{stats.active_bots}</p>
            </div>
            <div className="card bg-orange-50">
              <p className="text-sm font-medium text-orange-600">Plans Distribution</p>
              <div className="mt-1 text-xs text-orange-800">
                {Object.entries(stats.users_by_plan).map(([plan, count]) => (
                  <div key={plan}>
                    {plan}: {count as number}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Credits Form */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add Credits to User</h2>
          <form onSubmit={handleAddCredits} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Email
              </label>
              <input
                type="email"
                className="input"
                placeholder="user@example.com"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credits to Add
              </label>
              <input
                type="number"
                className="input"
                placeholder="100"
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(e.target.value)}
                required
                min="1"
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="btn-primary disabled:opacity-50"
            >
              {processing ? '⏳ Adding...' : '➕ Add Credits'}
            </button>
          </form>
        </div>

        {/* Users List */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Credits
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.full_name || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs uppercase">
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {u.credits_remaining}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => quickAddCredits(u.email, 10)}
                        disabled={processing}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => quickAddCredits(u.email, 50)}
                        disabled={processing}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                      >
                        +50
                      </button>
                      <button
                        onClick={() => quickAddCredits(u.email, 100)}
                        disabled={processing}
                        className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:opacity-50"
                      >
                        +100
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
