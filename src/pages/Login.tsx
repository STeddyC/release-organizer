import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Music2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password, rememberMe);
        navigate('/dashboard/releases');
      } else {
        await signup(email, password);
        navigate('/dashboard/releases');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard/releases');
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <Music2 className="h-12 w-12 text-primary" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            Music Organizer
          </span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={cn(
          "bg-white dark:bg-dark-100 py-8 px-4 shadow sm:rounded-lg sm:px-10",
          "border border-gray-200 dark:border-dark-300"
        )}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className={cn(
                  "mt-1 block w-full rounded-md",
                  "border border-gray-300 dark:border-dark-300",
                  "bg-white dark:bg-dark-200",
                  "text-gray-900 dark:text-white",
                  "py-2 px-3",
                  "focus:ring-primary focus:border-primary"
                )}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className={cn(
                  "mt-1 block w-full rounded-md",
                  "border border-gray-300 dark:border-dark-300",
                  "bg-white dark:bg-dark-200",
                  "text-gray-900 dark:text-white",
                  "py-2 px-3",
                  "focus:ring-primary focus:border-primary"
                )}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className={cn(
                      "h-4 w-4 rounded",
                      "border-gray-300 dark:border-dark-300",
                      "text-primary focus:ring-primary"
                    )}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full flex justify-center py-2 px-4",
                  "border border-transparent rounded-md",
                  "text-sm font-medium text-white",
                  "bg-primary hover:bg-primary/90",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  isLogin ? 'Sign in' : 'Sign up'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-dark-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-100 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={cn(
                  "w-full flex justify-center items-center",
                  "py-2 px-4 border border-gray-300 dark:border-dark-300",
                  "rounded-md shadow-sm text-sm font-medium",
                  "text-gray-700 dark:text-gray-300",
                  "bg-white dark:bg-dark-200",
                  "hover:bg-gray-50 dark:hover:bg-dark-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              className={cn(
                "w-full text-center text-sm",
                "text-gray-600 dark:text-gray-400",
                "hover:text-primary dark:hover:text-primary",
                "transition-colors"
              )}
              onClick={() => setIsLogin(!isLogin)}
              disabled={isLoading}
            >
              {isLogin ? "Don't have an account? Register Here" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;