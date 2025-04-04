import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

function NotFound() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50 flex flex-col items-center justify-center px-4">
      <div className={cn(
        "max-w-md w-full text-center",
        "bg-white dark:bg-dark-100",
        "rounded-lg shadow-lg p-8"
      )}>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to={user ? "/dashboard" : "/"}
          className={cn(
            "inline-flex items-center justify-center",
            "px-6 py-3 rounded-lg",
            "bg-primary text-white",
            "hover:bg-primary/90 transition-colors"
          )}
        >
          Go to {user ? "Dashboard" : "Home"}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;