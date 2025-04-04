import React from 'react';
import { BarChart as BarChartIcon, Users as UsersIcon, CreditCard as CreditCardIcon, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { cn } from '../../lib/utils';
import { format, subDays } from 'date-fns';

const revenueData = Array.from({ length: 7 }, (_, i) => ({
  date: format(subDays(new Date(), 6 - i), 'MMM dd'),
  amount: Math.floor(Math.random() * 1000) + 500
}));

const userSignupsData = Array.from({ length: 7 }, (_, i) => ({
  date: format(subDays(new Date(), 6 - i), 'MMM dd'),
  users: Math.floor(Math.random() * 20) + 5
}));

const subscriptionStats = {
  basic: 156,
  pro: 84,
  label: 32
};

function Dashboard() {
  const stats = [
    {
      name: 'Total Users',
      value: '272',
      change: '+12%',
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Subscriptions',
      value: '184',
      change: '+8%',
      icon: CreditCardIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Monthly Revenue',
      value: '$8,942',
      change: '+15%',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      name: 'Total Revenue',
      value: '$124,568',
      change: '+24%',
      icon: BarChartIcon,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={cn(
              "p-6 rounded-lg",
              "bg-white dark:bg-dark-100",
              "border border-gray-200 dark:border-dark-300"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={cn(
                "p-3 rounded-lg",
                stat.color,
                "bg-opacity-10 dark:bg-opacity-20"
              )}>
                <stat.icon className={cn(
                  "h-6 w-6",
                  stat.color.replace('bg-', 'text-')
                )} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm font-medium">{stat.change}</span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className={cn(
          "p-6 rounded-lg",
          "bg-white dark:bg-dark-100",
          "border border-gray-200 dark:border-dark-300"
        )}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Revenue</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fill: 'currentColor' }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  tick={{ fill: 'currentColor' }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(255 255 255 / 0.9)',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="amount" fill="#2B4EE6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Signups Chart */}
        <div className={cn(
          "p-6 rounded-lg",
          "bg-white dark:bg-dark-100",
          "border border-gray-200 dark:border-dark-300"
        )}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Signups</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userSignupsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fill: 'currentColor' }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  tick={{ fill: 'currentColor' }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(255 255 255 / 0.9)',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#2B4EE6"
                  strokeWidth={2}
                  dot={{ fill: '#2B4EE6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subscription Distribution */}
      <div className={cn(
        "p-6 rounded-lg",
        "bg-white dark:bg-dark-100",
        "border border-gray-200 dark:border-dark-300"
      )}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Subscription Distribution</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Basic', value: subscriptionStats.basic },
              { name: 'Pro', value: subscriptionStats.pro },
              { name: 'Label', value: subscriptionStats.label }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                tick={{ fill: 'currentColor' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                tick={{ fill: 'currentColor' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(255 255 255 / 0.9)',
                  border: '1px solid rgb(229 231 235)',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="value" fill="#2B4EE6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;