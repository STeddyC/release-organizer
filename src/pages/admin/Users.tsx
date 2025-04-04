import React, { useState } from 'react';
import { Search, Filter, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name: string;
  subscription: 'basic' | 'pro' | 'label';
  status: 'active' | 'inactive';
  joinedAt: Date;
  lastLogin: Date;
}

const mockUsers: User[] = Array.from({ length: 10 }, (_, i) => ({
  id: `user-${i + 1}`,
  email: `user${i + 1}@example.com`,
  name: `User ${i + 1}`,
  subscription: ['basic', 'pro', 'label'][Math.floor(Math.random() * 3)] as 'basic' | 'pro' | 'label',
  status: Math.random() > 0.2 ? 'active' : 'inactive',
  joinedAt: new Date(Date.now() - Math.random() * 10000000000),
  lastLogin: new Date(Date.now() - Math.random() * 1000000000)
}));

function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || user.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg",
                "bg-white dark:bg-dark-100",
                "border border-gray-200 dark:border-dark-300",
                "text-gray-900 dark:text-white",
                "placeholder-gray-500 dark:placeholder-gray-400"
              )}
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className={cn(
                "pl-9 pr-4 py-2 rounded-lg appearance-none",
                "bg-white dark:bg-dark-100",
                "border border-gray-200 dark:border-dark-300",
                "text-gray-900 dark:text-white"
              )}
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-dark-300">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-300">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                    user.subscription === 'basic' && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
                    user.subscription === 'pro' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
                    user.subscription === 'label' && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                  )}>
                    {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                    user.status === 'active' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  )}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {format(user.joinedAt, 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {format(user.lastLogin, 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;