import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Releases from './pages/Releases';
import Submissions from './pages/Submissions';
import Calendar from './pages/Calendar';
import CalendarDay from './pages/CalendarDay';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import SubscriptionGuard from './components/SubscriptionGuard';

// Configure React Router future flags
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router {...router}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard/releases" replace />} />
              <Route 
                path="releases" 
                element={
                  <SubscriptionGuard requiredTier="basic">
                    <Releases />
                  </SubscriptionGuard>
                } 
              />
              <Route 
                path="submissions" 
                element={
                  <SubscriptionGuard requiredTier="basic">
                    <Submissions />
                  </SubscriptionGuard>
                } 
              />
              <Route 
                path="calendar" 
                element={
                  <SubscriptionGuard requiredTier="basic">
                    <Calendar />
                  </SubscriptionGuard>
                } 
              />
              <Route 
                path="calendar/:date" 
                element={
                  <SubscriptionGuard requiredTier="basic">
                    <CalendarDay />
                  </SubscriptionGuard>
                } 
              />
              <Route 
                path="analytics" 
                element={
                  <SubscriptionGuard requiredTier="basic">
                    <Analytics />
                  </SubscriptionGuard>
                } 
              />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-dark-100 dark:text-text-dark',
            }}
          />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;