import React from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const plans = [
  {
    name: 'Basic',
    price: '$4.99',
    interval: 'month',
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
    interval: 'month',
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
    interval: 'month',
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

function PricingPlans() {
  const { user } = useAuth();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Simple, transparent pricing</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="mt-16 grid lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "rounded-xl p-8",
              "bg-white dark:bg-dark-100",
              "border",
              plan.highlighted
                ? "border-primary shadow-xl scale-105"
                : "border-gray-200 dark:border-dark-300"
            )}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
            <p className="mt-4 text-gray-600 dark:text-gray-300">{plan.description}</p>
            <p className="mt-8">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
            </p>
            <a
              href={plan.gumroadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mt-8 block w-full px-6 py-3 text-center text-base font-medium rounded-lg",
                plan.highlighted
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-50 dark:bg-dark-200 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-300"
              )}
            >
              Get Started
            </a>
            <ul className="mt-8 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="ml-3 text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PricingPlans;