import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/AuthContext';
import { botsAPI } from '@/lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const response = await botsAPI.list({ limit: 5 });
      setBots(response.data.bots || []);
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanLimits = (plan: string) => {
    const limits: any = {
      free: { pages: 2, credits: 2 },
      basic: { pages: 20, credits: 10 },
      pro: { pages: 50, credits: 40 },
      enterprise: { pages: 150, credits: 100 },
    };
    return limits[plan] || limits.free;
  };

  const planLimits = getPlanLimits(user?.plan || 'free');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your AI assistants and monitor your account.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Current Plan</p>
                <p className="text-2xl font-bold text-blue-900 uppercase mt-1">
                  {user?.plan}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
            <div className="mt-3 text-xs text-blue-700">
              <p>Page limit: {planLimits.pages} pages</p>
              <p>Monthly credits: {planLimits.credits}</p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Credits Remaining</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {user?.credits_remaining || 0}
                </p>
              </div>
              <div className="text-4xl">💎</div>
            </div>
            <div className="mt-3 text-xs text-green-700">
              <p>Credits roll over monthly</p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Bots</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {bots.length}
                </p>
              </div>
              <div className="text-4xl">🤖</div>
            </div>
            <div className="mt-3 text-xs text-purple-700">
              <p>Active AI assistants</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/bots/create')}
              className="flex items-center justify-between p-4 border-2 border-dashed border-primary rounded-lg hover:bg-primary-light hover:bg-opacity-10 transition-colors"
            >
              <div className="text-left">
                <p className="font-semibold text-primary">Create New Bot</p>
                <p className="text-sm text-gray-600">Build an AI assistant for your website</p>
              </div>
              <div className="text-3xl">➕</div>
            </button>

            <button
              onClick={() => router.push('/bots')}
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <p className="font-semibold text-gray-900">View All Bots</p>
                <p className="text-sm text-gray-600">Manage your existing assistants</p>
              </div>
              <div className="text-3xl">🤖</div>
            </button>
          </div>
        </div>

        {/* Recent Bots */}
        {bots.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bots</h2>
            <div className="space-y-3">
              {bots.map((bot: any) => (
                <div
                  key={bot.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors cursor-pointer"
                  onClick={() => router.push(`/bots/${bot.id}`)}
                >
                  <div>
                    <p className="font-semibold text-gray-900">{bot.bot_name}</p>
                    <p className="text-sm text-gray-600">{bot.website_url}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        bot.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : bot.status === 'creating'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {bot.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/bots')}
              className="mt-4 text-sm text-primary hover:text-primary-dark font-medium"
            >
              View all bots →
            </button>
          </div>
        )}

        {bots.length === 0 && !loading && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bots yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first AI assistant to get started
            </p>
            <button
              onClick={() => router.push('/bots/create')}
              className="btn-primary"
            >
              Create Your First Bot
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
