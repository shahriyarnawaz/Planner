import React from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [resetPassword, setResetPassword] = React.useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const backendError = data?.error || data?.detail;
        if (backendError) {
          setError(backendError);
        } else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          const firstMessage = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
          setError(firstMessage || 'Login failed. Please try again.');
        } else {
          setError('Login failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      if (data?.tokens?.access) {
        localStorage.setItem('accessToken', data.tokens.access);
      }
      if (data?.tokens?.refresh) {
        localStorage.setItem('refreshToken', data.tokens.refresh);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setLoading(false);

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      console.error('Login error', err);
      setError('Something went wrong. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!resetPassword || !resetConfirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          new_password: resetPassword,
          confirm_password: resetConfirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const backendError = data?.error || data?.detail || data?.non_field_errors?.[0];
        if (backendError) {
          setError(backendError);
        } else if (typeof data === 'object') {
          const keys = Object.keys(data || {});
          const firstKey = keys[0];
          const firstMessage = firstKey ? (Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]) : null;
          setError(firstMessage || 'Password reset failed. Please try again.');
        } else {
          setError('Password reset failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccessMessage(data?.message || 'Password reset successfully. You can now log in with your new password.');
      setResetPassword('');
      setResetConfirmPassword('');
    } catch (err) {
      console.error('Forgot password error', err);
      setError('Something went wrong. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-soft to-background flex items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-background-dark">
        {/* Left: Welcome text */}
        <div className="hidden md:flex flex-col justify-center gap-6 px-10 py-10 bg-cream-light rounded-3xl md:rounded-r-none">
          <p className="text-sm font-semibold tracking-wide text-accent-gold uppercase">
            Welcome back
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold text-heading leading-snug">
            Log in to your Planner
          </h1>
          <p className="text-body text-base leading-relaxed">
            Access your tasks, routines, and productivity insights all in one place.
          </p>
          <ul className="space-y-3 text-body text-sm">
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-gold text-[10px] text-white">
                ✓
              </span>
              Stay organized every day
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-gold text-[10px] text-white">
                ✓
              </span>
              See your upcoming schedule at a glance
            </li>
          </ul>
        </div>

        {/* Right: Form */}
        <div className="px-6 py-8 sm:px-8 md:px-10 md:py-10 bg-white rounded-3xl md:rounded-l-none flex flex-col justify-center">
          {/* Mobile heading */}
          <div className="mb-6 md:mb-8 md:hidden">
            <p className="text-sm font-semibold tracking-wide text-accent-gold uppercase">
              Welcome back
            </p>
            <h1 className="mt-2 text-2xl font-bold text-heading">
              Log in to your Planner
            </h1>
          </div>

          {showForgotPassword ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="block text-sm font-medium text-heading">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reset-password" className="block text-sm font-medium text-heading">
                  New password
                </label>
                <input
                  id="reset-password"
                  type="password"
                  required
                  className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  placeholder="Enter a new password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-heading">
                  Confirm new password
                </label>
                <input
                  id="reset-confirm-password"
                  type="password"
                  required
                  className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  placeholder="Re-enter your new password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {successMessage && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {successMessage}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-body">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Back to login
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-primary hover:bg-primary-dark disabled:bg-primary/60 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {loading ? 'Resetting password...' : 'Reset password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-heading">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-heading">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-body">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-background-dark text-primary focus:ring-primary-light"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-primary hover:bg-primary-dark disabled:bg-primary/60 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-body">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary hover:text-primary-dark font-semibold">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

