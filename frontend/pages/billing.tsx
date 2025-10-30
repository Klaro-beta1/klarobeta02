import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/AuthContext';

export default function Billing() {
  const { user } = useAuth();

  const plans = [
    { name: 'free', price: 0, pages: 2, credits: 2, features: ['Basic features', '"Powered by Nail" branding'] },
    { name: 'basic', price: 9, pages: 20, credits: 10, features: ['Remove branding', 'Priority support', 'Analytics'] },
    { name: 'pro', price: 19, pages: 50, credits: 40, features: ['All Basic features', 'White-label', 'Advanced customization'] },
    { name: 'enterprise', price: 59, pages: 150, credits: 100, features: ['All Pro features', 'Maximum pages', 'Dedicated support'] },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Credits</h1>
          <p className="mt-1 text-gray-600">Manage your subscription and credits</p>
        </div>

        {/* Current Plan */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-primary uppercase">{user?.plan}</p>
              <p className="text-gray-600 mt-1">{user?.credits_remaining} credits remaining</p>
            </div>
            <div className="text-5xl">💎</div>
          </div>
        </div>

        {/* Plans */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`border-2 rounded-lg p-4 ${
                  user?.plan === plan.name
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <h3 className="text-lg font-bold uppercase mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold mb-4">
                  ${plan.price}
                  <span className="text-sm text-gray-600">/month</span>
                </p>
                <ul className="text-sm space-y-2 mb-4">
                  <li>✓ {plan.pages} pages</li>
                  <li>✓ {plan.credits} credits/month</li>
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
                {user?.plan === plan.name ? (
                  <div className="px-4 py-2 bg-primary text-white text-center rounded-lg text-sm">
                    Current Plan
                  </div>
                ) : (
                  <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300">
                    Contact Support
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Credits */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Purchase Additional Credits</h2>
          <p className="text-gray-600 mb-4">
            Need more credits? Purchase additional credits anytime for $5 per 2 credits.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">2 Credits</p>
              <p className="text-sm text-gray-600">One-time purchase</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">$5</p>
              <button className="mt-2 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-dark">
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Payment Information</h3>
          <p className="text-sm text-blue-800 mb-2">
            Payment processing is not yet active in this MVP version.
            To upgrade your plan or purchase credits, please contact support.
          </p>
          <p className="text-sm text-blue-800">
            <strong>Admin UPI ID:</strong> mihirbhut08@okaxis
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
