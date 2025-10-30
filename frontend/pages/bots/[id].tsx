import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import { botsAPI } from '@/lib/api';

export default function BotDetails() {
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      loadBot();
    }
  }, [id]);

  const loadBot = async () => {
    try {
      const response = await botsAPI.get(id as string);
      setBot(response.data);
    } catch (error) {
      console.error('Failed to load bot:', error);
      alert('Bot not found');
      router.push('/bots');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim()) return;

    setTesting(true);
    setTestResponse('');

    try {
      const response = await botsAPI.test(id as string, testMessage);
      setTestResponse(response.data.response);
    } catch (error: any) {
      setTestResponse('Error: ' + (error.response?.data?.detail || 'Failed to get response'));
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading bot...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!bot) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{bot.bot_name}</h1>
            <p className="mt-1 text-gray-600">{bot.website_url}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 text-sm rounded-full ${
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

        {/* Status Message */}
        {bot.status === 'creating' && (
          <div className="card bg-yellow-50 border border-yellow-200">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⏳</div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Bot is being created</h3>
                <p className="text-sm text-yellow-800">
                  We're crawling your website and training the AI. This may take a few minutes.
                  Refresh this page to check the status.
                </p>
                <button
                  onClick={loadBot}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                >
                  🔄 Refresh Status
                </button>
              </div>
            </div>
          </div>
        )}

        {bot.status === 'failed' && (
          <div className="card bg-red-50 border border-red-200">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">❌</div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Bot creation failed</h3>
                <p className="text-sm text-red-800">
                  Something went wrong. Please try creating the bot again or contact support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Embed Code - Only show when active */}
        {bot.status === 'active' && bot.embed_code && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Embed Code</h2>
            <p className="text-sm text-gray-600 mb-3">
              Copy this code and paste it before the closing &lt;/body&gt; tag on your website:
            </p>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                {bot.embed_code}
              </pre>
              <button
                onClick={() => copyToClipboard(bot.embed_code, 'Embed code')}
                className="absolute top-2 right-2 px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary-dark"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* API Endpoint - Only show when active */}
        {bot.status === 'active' && bot.api_endpoint && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔗 API Endpoint</h2>
            <p className="text-sm text-gray-600 mb-3">
              Use this endpoint for programmatic access:
            </p>
            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {bot.api_endpoint}
              </pre>
              <button
                onClick={() => copyToClipboard(bot.api_endpoint, 'API endpoint')}
                className="absolute top-2 right-2 px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary-dark"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Test Bot - Only show when active */}
        {bot.status === 'active' && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🧪 Test Your Bot</h2>
            <form onSubmit={handleTest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Message
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ask your bot a question..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  disabled={testing}
                />
              </div>
              <button
                type="submit"
                disabled={testing || !testMessage.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {testing ? '⏳ Getting response...' : '💬 Send Message'}
              </button>
            </form>

            {testResponse && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">Bot Response:</p>
                <p className="text-sm text-blue-800">{testResponse}</p>
              </div>
            )}
          </div>
        )}

        {/* Bot Info */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ℹ️ Bot Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Pages Crawled</p>
              <p className="font-semibold">{bot.page_count}</p>
            </div>
            <div>
              <p className="text-gray-600">Widget Position</p>
              <p className="font-semibold">{bot.widget_position}</p>
            </div>
            <div>
              <p className="text-gray-600">Primary Color</p>
              <p className="font-semibold">{bot.primary_color}</p>
            </div>
            <div>
              <p className="text-gray-600">Conversation Memory</p>
              <p className="font-semibold">{bot.conversation_memory ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div>
              <p className="text-gray-600">Created</p>
              <p className="font-semibold">{new Date(bot.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="font-semibold">{new Date(bot.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/bots')}
            className="btn-secondary"
          >
            ← Back to Bots
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
