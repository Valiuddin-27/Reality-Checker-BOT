// frontend/src/pages/Auth.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // 1. Attempt Login
        const data = await authService.login(email, password);
        // 2. Save the VIP Wristband (JWT) to the browser's local storage
        localStorage.setItem('token', data.access_token);
        // 3. Send them to the dashboard
        navigate('/dashboard');
      } else {
        // 1. Attempt Signup
        await authService.signup(email, password);
        // 2. If successful, automatically log them in
        const data = await authService.login(email, password);
        localStorage.setItem('token', data.access_token);
        navigate('/dashboard');
      }
    } catch (err) {
      // Catch any errors our FastAPI backend throws (like "Email already registered")
      const errorDetail = err.response?.data?.detail;
      setError(typeof errorDetail === 'string' ? errorDetail : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* The Glassmorphism Card */}
        <div className="bg-surface rounded-2xl p-8 shadow-2xl border border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-textMain mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-textMuted">
              {isLogin ? 'Enter your details to access your memory.' : 'Start analyzing your world today.'}
            </p>
          </div>

          {/* Display Backend Errors */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg p-3 mb-6 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted h-5 w-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-background border border-gray-700 text-textMain rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted h-5 w-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 8 characters)"
                  className="w-full bg-background border border-gray-700 text-textMain rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg py-3 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-textMuted hover:text-textMain text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;