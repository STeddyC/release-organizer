import React from 'react';
import { toast } from 'react-hot-toast';

interface NotificationToastProps {
  t: {
    visible: boolean;
    id: string;
  };
  notification: {
    title: string;
    body: string;
    icon?: string;
  };
}

export function NotificationToast({ t, notification }: NotificationToastProps) {
  return (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <img
              className="h-10 w-10 rounded-full"
              src={notification.icon || '/logo-square.png'}
              alt=""
            />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {notification.body}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Close
        </button>
      </div>
    </div>
  );
}