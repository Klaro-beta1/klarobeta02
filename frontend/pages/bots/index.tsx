import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import { botsAPI } from '@/lib/api';

export default function BotsPage() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const response = await botsAPI.list();
      setBots(response.data.bots || []);
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (botId: string, botName: string) => {
    if (!confirm(`Are you sure you want to delete "${botName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await botsAPI.delete(botId);
      setBots(bots.filter((bot: any) => bot.id !== botId));
    } catch (error) {
      console.error('Failed to delete bot:', error);
      alert('Failed to delete bot. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bots</h1>
            <p className="mt-1 text-gray-600">Manage your AI assistants</p>
          </div>
          <button
            onClick={() => router.push('/bots/create')}
            className="btn-primary"
          >
            ➕ Create New Bot
          </button>
        </div>

        {/* Bots List */}
        {loading ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">Loading bots...</p>
          </div>
        ) : bots.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bots.map((bot: any) => (
              <div key={bot.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{bot.bot_name}</h3>
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
                    <p className="text-sm text-gray-600 mt-1">{bot.website_url}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {bot.page_count} pages • Created {new Date(bot.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/bots/${bot.id}`)}
                      className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(bot.id, bot.bot_name)}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
