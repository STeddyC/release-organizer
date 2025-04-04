import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSubscriptionTier } from '../lib/analytics';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier: 'basic' | 'pro' | 'label';
}

function SubscriptionGuard({ children, requiredTier }: SubscriptionGuardProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const tier = await getSubscriptionTier();
        const tierLevels = {
          basic: 0,
          pro: 1,
          label: 2
        };
        
        setHasAccess(tierLevels[tier] >= tierLevels[requiredTier]);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkSubscription();
  }, [user, requiredTier]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center p-4",
        "bg-gray-50 dark:bg-dark-50"
      )}>
        <div className={cn(
          "max-w-md w-full text-center p-8 rounded-lg",
          "bg-white dark:bg-dark-100",
          "border border-gray-200 dark:border-dark-300"
        )}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Upgrade Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This feature requires a {requiredTier} subscription or higher.
            Please upgrade your plan to access this content.
          </p>
          <a
            href="/dashboard/settings"
            className={cn(
              "inline-block px-6 py-3 rounded-lg",
              "bg-primary text-white",
              "hover:bg-primary/90 transition-colors"
            )}
          >
            Upgrade Now
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default SubscriptionGuard;