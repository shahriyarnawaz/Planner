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

      const resolveRoleIfMissing = async () => {
        try {
          const rawUser = localStorage.getItem('user');
          const accessToken = localStorage.getItem('accessToken');
          if (!rawUser || !accessToken) return;

          const parsedUser = JSON.parse(rawUser);
          const existingRole = parsedUser?.role || parsedUser?.profile?.role;
          if (existingRole) return;

          const profileResponse = await fetch(`${API_BASE_URL}/users/profile/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!profileResponse.ok) return;
          const profileData = await profileResponse.json();

          const mergedUser = {
            ...(parsedUser || {}),
            profile: {
              ...(parsedUser?.profile || {}),
              ...(profileData || {}),
            },
          };
          localStorage.setItem('user', JSON.stringify(mergedUser));
        } catch (e) {
          return;
        }
      };

      await resolveRoleIfMissing();

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md bg-white border border-background-dark rounded-2xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-bold text-heading mb-2">Welcome Back</h1>
        <p className="text-sm text-text-secondary mb-6">Login to continue to your planner.</p>

        {/* <div className="mb-6 rounded-xl border border-background-dark bg-background-soft p-4">
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Super Admin</div>
          <div className="mt-1 text-sm text-text-secondary">
            If you started the backend server, Super Admin credentials are printed in the terminal.
          </div>
        </div> */}

        {showForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-heading mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-background-dark px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-1">New Password</label>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-background-dark px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-1">Confirm Password</label>
              <input
                type="password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-background-dark px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {successMessage && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary hover:bg-primary-dark disabled:bg-primary/60 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? 'Submitting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError('');
                setSuccessMessage('');
              }}
              className="w-full rounded-xl border border-background-dark bg-white py-3 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-heading mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-background-dark px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-background-dark px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                placeholder="Enter your password"
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
  );
};

export default Login;

