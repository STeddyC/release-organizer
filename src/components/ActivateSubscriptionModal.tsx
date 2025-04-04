import React, { useState } from 'react';
import { X } from 'lucide-react';
import { activateSubscription } from '../lib/gumroad';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

interface ActivateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ActivateSubscriptionModal({ isOpen, onClose, onSuccess }: ActivateSubscriptionModalProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await activateSubscription(licenseKey);
      if (result.success) {
        toast.success(`Successfully activated ${result.tier} subscription`);
        onSuccess();
        onClose();
      } else {
        toast.error('Invalid license key');
      }
    } catch (error) {
      toast.error('Failed to activate subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={cn(
        "w-full max-w-md rounded-lg p-6",
        "bg-white dark:bg-dark-100"
      )}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activate Subscription</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gumroad License Key
            </label>
            <input
              type="text"
              id="licenseKey"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Enter your license key"
              className={cn(
                "w-full rounded-md p-2",
                "border border-gray-300 dark:border-dark-300",
                "focus:ring-primary focus:border-primary",
                "dark:bg-dark-200 dark:text-white"
              )}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "px-4 py-2 rounded-md",
                "border border-gray-300 dark:border-dark-300",
                "text-gray-700 dark:text-gray-300",
                "hover:bg-gray-50 dark:hover:bg-dark-200"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "px-4 py-2 rounded-md",
                "bg-primary text-white",
                "hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? 'Activating...' : 'Activate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ActivateSubscriptionModal;