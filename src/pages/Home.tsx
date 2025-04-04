import React from 'react';
import { Link } from 'react-router-dom';
import { Music2, Calendar, Send, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const features = [
  {
    icon: Music2,
    title: 'Release Management',
    description: 'Keep track of all your music releases in one place. Never miss a release date again.'
  },
  {
    icon: Send,
    title: 'Label Submissions',
    description: 'Manage and track your label submissions. Get notified when responses are due.'
  },
  {
    icon: Calendar,
    title: 'Release Calendar',
    description: 'Visual calendar view of your releases and submissions. Plan your music strategy effectively.'
  }
];

const tiers = [
  {
    name: 'Basic',
    price: '$4.99',
    description: 'Perfect for solo artists just getting started',
    features: [
      '1 artist profile',
      'Up to 5 releases per month',
      'Basic analytics',
      'Email support'
    ]
  },
  {
    name: 'Pro',
    price: '$9.99',
    description: 'For growing artists and small labels',
    features: [
      '5 artists',
      'Unlimited releases',
      'Advanced analytics',
      'Priority support'
    ],
    highlighted: true
  },
  {
    name: 'Label',
    price: '$29.99',
    description: 'For record labels and management companies',
    features: [
      'Unlimited artists',
      'Unlimited releases',
      'Advanced analytics with exports',
      'Dedicated support',
      'Team collaboration'
    ]
  }
];

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent dark:from-primary/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Organize Your Music Career
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              The all-in-one platform for managing your music releases, submissions, and promotional campaigns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-dark-300 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white dark:bg-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Powerful tools to help you manage and grow your music career
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={cn(
                  "p-6 rounded-xl",
                  "bg-gray-50 dark:bg-dark-200",
                  "border border-gray-100 dark:border-dark-300"
                )}
              >
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-gray-50 dark:bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that best fits your needs
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "rounded-xl p-8",
                  "bg-white dark:bg-dark-100",
                  "border",
                  tier.highlighted
                    ? "border-primary shadow-xl scale-105"
                    : "border-gray-200 dark:border-dark-300"
                )}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tier.name}
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  {tier.description}
                </p>
                <p className="mt-8">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {tier.price}
                  </span>
                  {tier.price !== 'Free' && (
                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                  )}
                </p>
                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className={cn(
                    "mt-8 block w-full px-6 py-3 text-center text-base font-medium rounded-lg",
                    tier.highlighted
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-gray-50 dark:bg-dark-200 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-300"
                  )}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;