import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Music, Send, Calendar, Settings, LogOut, Menu, X, Sun, Moon, BarChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import Logo from './Logo';

function Layout() {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const navItems = [
    { to: '/dashboard/releases', icon: Music, label: 'Releases' },
    { to: '/dashboard/submissions', icon: Send, label: 'Submissions' },
    { to: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/dashboard/analytics', icon: BarChart, label: 'Analytics' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={cn(
      "flex flex-col md:flex-row min-h-screen",
      "dark:bg-dark-50 bg-white transition-colors duration-200"
    )}>
      {/* Mobile Header */}
      <div className={cn(
        "md:hidden p-4 flex items-center justify-between border-b",
        "bg-white dark:bg-dark-100",
        "border-gray-200 dark:border-dark-200"
      )}>
        <Logo isCollapsed={true} variant={isDark ? 'light' : 'dark'} />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg",
              "text-gray-600 dark:text-gray-400",
              "hover:bg-gray-100 dark:hover:bg-dark-200",
              "transition-colors"
            )}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={toggleMobileMenu}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav 
        className={cn(
          "w-16 md:w-16 hover:w-64 flex flex-col transition-all duration-300 ease-in-out",
          "bg-white dark:bg-dark-100 border-r border-gray-200 dark:border-dark-200",
          "fixed md:static inset-x-0 top-[72px] md:top-0 z-30 transform",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "h-[calc(100vh-72px)] md:h-screen"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="hidden md:flex items-center justify-between p-4">
            <Logo isCollapsed={!isHovered} variant={isDark ? 'light' : 'dark'} />
            {isHovered && (
              <button
                onClick={toggleTheme}
                className={cn(
                  "p-2 rounded-lg",
                  "text-gray-600 dark:text-gray-400",
                  "hover:bg-gray-100 dark:hover:bg-dark-200",
                  "transition-colors"
                )}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-2 py-4 space-y-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center h-10 gap-3 px-3 rounded-lg transition-colors",
                    "text-gray-600 dark:text-gray-400",
                    "hover:text-gray-900 dark:hover:text-white",
                    "hover:bg-gray-100 dark:hover:bg-dark-200",
                    isActive && "bg-gray-100 dark:bg-dark-200 text-gray-900 dark:text-white",
                    "overflow-hidden whitespace-nowrap"
                  )
                }
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className={cn(
                  "transition-opacity duration-300",
                  isHovered ? "opacity-100" : "opacity-0"
                )}>
                  {label}
                </span>
              </NavLink>
            ))}
          </div>

          {/* Logout Button */}
          <div className="px-2 pb-4">
            <button
              onClick={() => logout()}
              className={cn(
                "flex items-center h-10 gap-3 px-3 rounded-lg transition-colors w-full",
                "text-gray-600 dark:text-gray-400",
                "hover:text-gray-900 dark:hover:text-white",
                "hover:bg-gray-100 dark:hover:bg-dark-200",
                "overflow-hidden whitespace-nowrap"
              )}
            >
              <LogOut size={20} className="flex-shrink-0" />
              <span className={cn(
                "transition-opacity duration-300",
                isHovered ? "opacity-100" : "opacity-0"
              )}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out",
        "pt-4 md:pt-8 px-4 md:px-8 md:ml-16",
        "bg-gray-50 dark:bg-dark-50"
      )}>
        <Outlet />
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;