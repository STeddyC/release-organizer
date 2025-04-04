import React from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const plans = [
  {
    name: 'Basic',
    price: '$4.99',
    features: [
      '1 artist profile',
      'Up to 5 releases per month',
      'Basic analytics',
      'Email support'
    ],
    gumroadUrl: 'https://gumroad.com/l/hndlyt?variant=basic',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '$9.99',
    features: [
      '5 artists',
      'Unlimited releases',
      'Advanced analytics',
      'Priority support'
    ],
    gumroadUrl: 'https://gumroad.com/l/hndlyt?variant=pro',
    highlighted: true
  },
  {
    name: 'Label',
    price: '$29.99',
    features: [
      'Unlimited artists',
      'Unlimited releases',
      'Advanced analytics with exports',
      'Dedicated support',
      'Team collaboration'
    ],
    gumroadUrl: 'https://gumroad.com/l/hndlyt?variant=label',
    highlighted: false
  }
];

interface SubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SubscriptionPlanModal({ isOpen, onClose }: SubscriptionPlanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={cn(
        "w-full max-w-4xl bg-white dark:bg-dark-100 rounded-xl p-6",
        "border border-gray-200 dark:border-dark-300"
      )}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Choose a Plan
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              You need a subscription to add releases and submissions
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-xl p-6",
                "bg-white dark:bg-dark-100",
                "border",
                plan.highlighted
                  ? "border-primary shadow-lg scale-105"
                  : "border-gray-200 dark:border-dark-300"
              )}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="mt-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </p>
              <a
                href={plan.gumroadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "mt-6 block w-full px-4 py-2 text-center text-sm font-medium rounded-lg",
                  plan.highlighted
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-50 dark:bg-dark-200 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-300"
                )}
              >
                Get Started
              </a>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPlanModal;