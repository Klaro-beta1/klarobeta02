import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    // For MVP, password change is not implemented
    alert('Password change is not available in the MVP. Please contact support.');
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600">Manage your account settings</p>
        </div>

        {/* Account Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="input"
                value={user?.email || ''}
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="input"
                value={user?.full_name || 'Not provided'}
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">
                Name cannot be changed in MVP
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Plan
              </label>
              <input
                type="text"
                className="input uppercase"
                value={user?.plan || 'free'}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credits Remaining
              </label>
              <input
                type="text"
                className="input"
                value={user?.credits_remaining || 0}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Change Password - Only for non-OAuth users */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                className="input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn-primary">
              Change Password
            </button>
          </form>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Password reset is not available in this MVP.
              If you forget your password, please contact support or create a new account.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-200">
          <h2 className="text-xl font-bold text-red-900 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Logout</p>
                <p className="text-sm text-gray-600">Sign out of your account</p>
              </div>
              <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
