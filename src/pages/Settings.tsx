import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PricingPlans from '../components/PricingPlans';
import { cn } from '../lib/utils';
import { 
  requestNotificationPermission, 
  updateNotificationPreferences,
  loadNotificationPreferences,
  NotificationPreferences
} from '../lib/notifications';
import { getSubscriptionTier } from '../lib/analytics';
import { activateSubscription } from '../lib/gumroad';
import ActivateSubscriptionModal from '../components/ActivateSubscriptionModal';

function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'account' | 'billing'>(() => {
    return searchParams.get('tab') === 'billing' ? 'billing' : 'account';
  });
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [currentTier, setCurrentTier] = useState<'basic' | 'pro' | 'label'>('basic');

  useEffect(() => {
    async function initializeData() {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const [preferences, tier] = await Promise.all([
          loadNotificationPreferences(user.uid),
          getSubscriptionTier()
        ]);
        
        setNotificationPreferences(preferences);
        setCurrentTier(tier);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }

    initializeData();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Profile update logic would go here
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    try {
      // Password reset logic would go here
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error('Failed to send password reset email');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Account deletion logic would go here
        toast.success('Account deleted successfully');
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  const handleEmailNotificationsToggle = async (enabled: boolean) => {
    if (!user?.uid || !notificationPreferences) return;

    try {
      await updateNotificationPreferences(user.uid, {
        ...notificationPreferences,
        email: enabled
      });
      setNotificationPreferences(prev => prev ? { ...prev, email: enabled } : null);
      toast.success(`Email notifications ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating email notifications:', error);
      toast.error('Failed to update email notification settings');
    }
  };

  const handlePushNotificationsToggle = async (enabled: boolean) => {
    if (!user?.uid || !notificationPreferences) return;

    try {
      if (enabled) {
        const success = await requestNotificationPermission(user.uid);
        if (success) {
          setNotificationPreferences(prev => prev ? { ...prev, pushEnabled: true } : null);
          toast.success('Push notifications enabled');
        }
      } else {
        await updateNotificationPreferences(user.uid, {
          ...notificationPreferences,
          pushEnabled: false
        });
        setNotificationPreferences(prev => prev ? { ...prev, pushEnabled: false } : null);
        toast.success('Push notifications disabled');
      }
    } catch (error) {
      console.error('Error updating push notifications:', error);
      toast.error('Failed to update push notification settings');
    }
  };

  const handleActivateSubscription = async () => {
    setIsActivateModalOpen(true);
  };

  const handleSubscriptionActivated = async () => {
    const tier = await getSubscriptionTier();
    setCurrentTier(tier);
    toast.success(`Successfully upgraded to ${tier} tier`);
    setIsActivateModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-dark-200 rounded w-48 mb-8"></div>
          <div className="space-y-6">
            <div className="h-40 bg-gray-200 dark:bg-dark-200 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-dark-200 rounded"></div>
            <div className="h-40 bg-gray-200 dark:bg-dark-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('account')}
            className={cn(
              "px-4 py-2 rounded-lg",
              activeTab === 'account'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300'
            )}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={cn(
              "px-4 py-2 rounded-lg",
              activeTab === 'billing'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300'
            )}
          >
            Billing
          </button>
        </div>
      </div>

      {activeTab === 'account' ? (
        <>
          {/* Account Settings */}
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "w-full rounded-md px-3 py-2",
                    "border border-gray-300 dark:border-dark-300",
                    "focus:ring-primary focus:border-primary",
                    "dark:bg-dark-200 dark:text-white"
                  )}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full rounded-md px-3 py-2",
                    "border border-gray-300 dark:border-dark-300",
                    "focus:ring-primary focus:border-primary",
                    "dark:bg-dark-200 dark:text-white"
                  )}
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about your releases</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPreferences?.email || false}
                    onChange={(e) => handleEmailNotificationsToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={cn(
                    "w-11 h-6 bg-gray-200 dark:bg-dark-300",
                    "peer-focus:outline-none peer-focus:ring-4",
                    "peer-focus:ring-primary/20",
                    "rounded-full peer",
                    "peer-checked:after:translate-x-full",
                    "peer-checked:after:border-white",
                    "after:content-['']",
                    "after:absolute after:top-[2px] after:left-[2px]",
                    "after:bg-white after:border-gray-300 dark:after:border-dark-400",
                    "after:border after:rounded-full after:h-5 after:w-5",
                    "after:transition-all",
                    "peer-checked:bg-primary"
                  )}></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications about submissions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPreferences?.pushEnabled || false}
                    onChange={(e) => handlePushNotificationsToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={cn(
                    "w-11 h-6 bg-gray-200 dark:bg-dark-300",
                    "peer-focus:outline-none peer-focus:ring-4",
                    "peer-focus:ring-primary/20",
                    "rounded-full peer",
                    "peer-checked:after:translate-x-full",
                    "peer-checked:after:border-white",
                    "after:content-['']",
                    "after:absolute after:top-[2px] after:left-[2px]",
                    "after:bg-white after:border-gray-300 dark:after:border-dark-400",
                    "after:border after:rounded-full after:h-5 after:w-5",
                    "after:transition-all",
                    "peer-checked:bg-primary"
                  )}></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
            <div className="space-y-4">
              <button
                onClick={handleChangePassword}
                className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={handleDeleteAccount}
                className={cn(
                  "w-full px-4 py-2 rounded-md",
                  "bg-red-50 dark:bg-red-900/30",
                  "text-red-600 dark:text-red-400",
                  "hover:bg-red-100 dark:hover:bg-red-900/50",
                  "transition-colors"
                )}
              >
                Delete Account
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Plan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You are currently on the {currentTier} plan
                </p>
              </div>
              <button
                onClick={handleActivateSubscription}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
          <PricingPlans />
        </>
      )}

      <ActivateSubscriptionModal
        isOpen={isActivateModalOpen}
        onClose={() => setIsActivateModalOpen(false)}
        onSuccess={handleSubscriptionActivated}
      />
    </div>
  );
}

export default Settings;