import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, ChevronDown, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAnalytics, getSubscriptionTier } from '../lib/analytics';
import { cn } from '../lib/utils';

type DateRange = '7d' | '30d' | '90d' | 'custom';
type ChartType = 'releases' | 'submissions' | 'approvals';

function Analytics() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  const [subscriptionTier, setSubscriptionTier] = useState<'basic' | 'pro' | 'label'>('basic');
  const [selectedChart, setSelectedChart] = useState<ChartType>('releases');

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      setIsLoading(true);
      try {
        const tier = await getSubscriptionTier();
        setSubscriptionTier(tier || 'basic');

        let startDate;
        let endDate = new Date();

        switch (dateRange) {
          case '7d':
            startDate = subDays(new Date(), 7);
            break;
          case '30d':
            startDate = subDays(new Date(), 30);
            break;
          case '90d':
            startDate = subDays(new Date(), 90);
            break;
          case 'custom':
            startDate = customRange.start;
            endDate = customRange.end;
            break;
        }

        const data = await getAnalytics(startDate, endDate);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user, dateRange, customRange]);

  const handleExport = () => {
    if (subscriptionTier === 'basic') return;

    const csvData = analyticsData.map(item => ({
      date: format(new Date(item.created_at), 'yyyy-MM-dd'),
      type: item.type,
      release: item.releases?.name || '',
      artist: item.releases?.artist || ''
    }));

    const csv = [
      ['Date', 'Type', 'Release', 'Artist'],
      ...csvData.map(row => [row.date, row.type, row.release, row.artist])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const basicMetrics = {
    totalReleases: analyticsData.filter(item => item.type === 'view').length,
    totalSubmissions: analyticsData.filter(item => item.type === 'submission').length,
    approvalRate: Math.round(
      (analyticsData.filter(item => item.type === 'approval').length /
        analyticsData.filter(item => item.type === 'submission').length) * 100
    ) || 0
  };

  const advancedMetrics = subscriptionTier !== 'basic' ? {
    viewsByRelease: analyticsData.reduce((acc, item) => {
      if (item.type === 'view' && item.releases) {
        acc[item.releases.name] = (acc[item.releases.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    submissionsByLabel: analyticsData.reduce((acc, item) => {
      if (item.type === 'submission' && item.releases) {
        acc[item.releases.label] = (acc[item.releases.label] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    dailyActivity: analyticsData.reduce((acc, item) => {
      const date = format(new Date(item.created_at), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  } : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        
        <div className="flex flex-wrap gap-3">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className={cn(
                "appearance-none pl-3 pr-8 py-2 rounded-lg",
                "bg-white dark:bg-dark-100",
                "border border-gray-200 dark:border-dark-300",
                "text-gray-900 dark:text-white"
              )}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom Range</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={format(customRange.start, 'yyyy-MM-dd')}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                className={cn(
                  "px-3 py-2 rounded-lg",
                  "bg-white dark:bg-dark-100",
                  "border border-gray-200 dark:border-dark-300",
                  "text-gray-900 dark:text-white"
                )}
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={format(customRange.end, 'yyyy-MM-dd')}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                className={cn(
                  "px-3 py-2 rounded-lg",
                  "bg-white dark:bg-dark-100",
                  "border border-gray-200 dark:border-dark-300",
                  "text-gray-900 dark:text-white"
                )}
              />
            </div>
          )}

          {/* Export Button (Pro/Label only) */}
          {subscriptionTier !== 'basic' && (
            <button
              onClick={handleExport}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-white",
                "hover:bg-primary/90 transition-colors"
              )}
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={cn(
              "p-6 rounded-lg",
              "bg-white dark:bg-dark-100",
              "border border-gray-200 dark:border-dark-300"
            )}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Releases</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{basicMetrics.totalReleases}</p>
            </div>
            <div className={cn(
              "p-6 rounded-lg",
              "bg-white dark:bg-dark-100",
              "border border-gray-200 dark:border-dark-300"
            )}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Submissions</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{basicMetrics.totalSubmissions}</p>
            </div>
            <div className={cn(
              "p-6 rounded-lg",
              "bg-white dark:bg-dark-100",
              "border border-gray-200 dark:border-dark-300"
            )}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Approval Rate</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{basicMetrics.approvalRate}%</p>
            </div>
          </div>

          {/* Advanced Analytics (Pro/Label only) */}
          {subscriptionTier !== 'basic' && advancedMetrics && (
            <>
              {/* Chart Type Selector */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedChart('releases')}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors",
                    selectedChart === 'releases'
                      ? "bg-primary text-white"
                      : "bg-white dark:bg-dark-100 text-gray-700 dark:text-gray-300"
                  )}
                >
                  Releases
                </button>
                <button
                  onClick={() => setSelectedChart('submissions')}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors",
                    selectedChart === 'submissions'
                      ? "bg-primary text-white"
                      : "bg-white dark:bg-dark-100 text-gray-700 dark:text-gray-300"
                  )}
                >
                  Submissions
                </button>
                <button
                  onClick={() => setSelectedChart('approvals')}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors",
                    selectedChart === 'approvals'
                      ? "bg-primary text-white"
                      : "bg-white dark:bg-dark-100 text-gray-700 dark:text-gray-300"
                  )}
                >
                  Approvals
                </button>
              </div>

              {/* Charts */}
              <div className={cn(
                "p-6 rounded-lg",
                "bg-white dark:bg-dark-100",
                "border border-gray-200 dark:border-dark-300"
              )}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Activity Over Time</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={Object.entries(advancedMetrics.dailyActivity).map(([date, count]) => ({
                      date,
                      count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: subscriptionTier === 'basic' ? '#6B7280' : '#E4E6EA' }}
                      />
                      <YAxis
                        tick={{ fill: subscriptionTier === 'basic' ? '#6B7280' : '#E4E6EA' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: subscriptionTier === 'basic' ? '#FFFFFF' : '#242526',
                          borderColor: subscriptionTier === 'basic' ? '#E5E7EB' : '#3A3B3C'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#2B4EE6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={cn(
                  "p-6 rounded-lg",
                  "bg-white dark:bg-dark-100",
                  "border border-gray-200 dark:border-dark-300"
                )}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Views by Release</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(advancedMetrics.viewsByRelease).map(([name, count]) => ({
                        name,
                        count
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: subscriptionTier === 'basic' ? '#6B7280' : '#E4E6EA' }}
                        />
                        <YAxis
                          tick={{ fill: subscriptionTier === 'basic' ? '#6B7280' : '#E4E6EA' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: subscriptionTier === 'basic' ? '#FFFFFF' : '#242526',
                            borderColor: subscriptionTier === 'basic' ? '#E5E7EB' : '#3A3B3C'
                          }}
                        />
                        <Bar dataKey="count" fill="#2B4EE6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={cn(
                  "p-6 rounded-lg",
                  "bg-white dark:bg-dark-100",
                  "border border-gray-200 dark:border-dark-300"
                )}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Submissions by Label</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(advancedMetrics.submissionsByLabel).map(([label, count]) => ({
                        label,
                        count
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: subscriptionTier === 'basic' ? '#6B7280' : '#E4E6EA' }}
                        />
                        <YAxis
                          tick={{ fill: subscriptionTier === 'basic' ? '#6B7280' : '#E4E6EA' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: subscriptionTier === 'basic' ? '#FFFFFF' : '#242526',
                            borderColor: subscriptionTier === 'basic' ? '#E5E7EB' : '#3A3B3C'
                          }}
                        />
                        <Bar dataKey="count" fill="#2B4EE6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Upgrade Notice for Basic Users */}
          {subscriptionTier === 'basic' && (
            <div className={cn(
              "p-6 rounded-lg text-center",
              "bg-primary/5 dark:bg-primary/10",
              "border border-primary/20"
            )}>
              <h3 className="text-lg font-semibold text-primary mb-2">Unlock Advanced Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upgrade to Pro or Label tier to access detailed analytics, including charts, trends, and data export.
              </p>
              <a
                href="https://gumroad.com/l/hndlyt?variant=pro"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Upgrade Now
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Analytics;