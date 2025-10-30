import { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/AuthContext';
import { botsAPI } from '@/lib/api';

export default function CreateBot() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [botName, setBotName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!websiteUrl || !botName) {
      setError('Please fill in all fields');
      return;
    }

    if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      setError('Website URL must start with http:// or https://');
      return;
    }

    if ((user?.credits_remaining || 0) < 1) {
      setError('You need at least 1 credit to create a bot. Please purchase more credits or upgrade your plan.');
      return;
    }

    setLoading(true);

    try {
      const response = await botsAPI.create({
        website_url: websiteUrl,
        bot_name: botName,
      });

      const bot = response.data;

      // Redirect to bot details page
      router.push(`/bots/${bot.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create bot. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Bot</h1>
          <p className="mt-1 text-gray-600">
            Build an AI assistant for your website in minutes
          </p>
        </div>

        {/* Plan Info */}
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Your Plan Limits</h3>
              <p className="text-sm text-blue-800">
                <strong>{user?.plan.toUpperCase()}</strong> plan:{' '}
                Up to {planLimits.pages} pages • {user?.credits_remaining || 0} credits remaining
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Creating a bot costs 1 credit. Your site must have {planLimits.pages} or fewer pages.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL *
              </label>
              <input
                id="websiteUrl"
                type="url"
                required
                className="input"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the full URL of your website including http:// or https://
              </p>
            </div>

            <div>
              <label htmlFor="botName" className="block text-sm font-medium text-gray-700 mb-2">
                Bot Name *
              </label>
              <input
                id="botName"
                type="text"
                required
                maxLength={100}
                className="input"
                placeholder="My Website Assistant"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Choose a friendly name for your AI assistant
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="font-semibold text-primary mr-2">1.</span>
                  <span>We'll crawl your website and analyze all pages</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-primary mr-2">2.</span>
                  <span>Claude AI will be trained on your content</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-primary mr-2">3.</span>
                  <span>You'll get an embed code to add to your website</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-primary mr-2">4.</span>
                  <span>Your visitors can chat with your AI assistant!</span>
                </li>
              </ol>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading || (user?.credits_remaining || 0) < 1}
                className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Creating Bot...' : '🚀 Create Bot (1 Credit)'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/bots')}
                disabled={loading}
                className="px-6 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Help Section */}
        <div className="card bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600">
            Make sure your website is publicly accessible and doesn't block web crawlers.
            The bot creation process may take a few minutes depending on your site size.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
