import React from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const Signup = ({ onSignupSuccess }) => {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const rawText = await response.text();
      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (parseErr) {
        data = null;
      }

      if (!response.ok) {
        if (!data) {
          const preview = (rawText || '').slice(0, 180);
          setError(
            `Registration failed (non-JSON response). Check API URL/backend server. Response: ${preview}`
          );
          setLoading(false);
          return;
        }

        const backendError = data?.error || data?.detail || data?.non_field_errors?.[0];
        if (backendError) {
          setError(backendError);
        } else if (typeof data === 'object') {
          if (Array.isArray(data?.email) && String(data.email[0] || '').toLowerCase().includes('unique')) {
            setError('This email is already registered. Please use a different email.');
            setLoading(false);
            return;
          }

          const keys = Object.keys(data || {});
          const firstKey = keys[0];
          const firstMessage = firstKey ? (Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]) : null;
          setError(firstMessage || 'Registration failed. Please try again.');
        } else {
          setError('Registration failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      if (!data) {
        setError('Registration failed (invalid response). Please try again.');
        setLoading(false);
        return;
      }

      setSuccessMessage(
        data?.message ||
          'Signup request submitted. Your account is pending Super Admin approval. You will receive an email once approved.'
      );
      setLoading(false);

      setTimeout(() => {
        if (onSignupSuccess) {
          onSignupSuccess();
        }
      }, 800);
    } catch (err) {
      console.error('Signup error', err);
      setError('Something went wrong. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-soft to-background flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-background-dark">
        {/* Left: Marketing / Info */}
        <div className="hidden md:flex flex-col justify-center gap-6 px-10 py-10 bg-cream-light rounded-3xl md:rounded-r-none">
          <p className="text-sm font-semibold tracking-wide text-accent-gold uppercase">
            Free account
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold text-heading leading-snug">
            Create your Planner account
          </h1>
          <p className="text-body text-base leading-relaxed">
            Start organizing tasks, building routines, and staying productive with your personal planner dashboard.
          </p>
          <ul className="space-y-3 text-body text-sm">
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-gold text-[10px] text-white">
                ✓
              </span>
              Unlimited tasks and routines
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-gold text-[10px] text-white">
                ✓
              </span>
              Smart reminders and insights
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-gold text-[10px] text-white">
                ✓
              </span>
              No credit card required
            </li>
          </ul>
        </div>

        {/* Right: Form */}
        <div className="px-6 py-8 sm:px-8 md:px-10 md:py-10 bg-white rounded-3xl md:rounded-l-none flex flex-col justify-center">
          {/* Mobile heading */}
          <div className="mb-6 md:mb-8 md:hidden">
            <p className="text-sm font-semibold tracking-wide text-accent-gold uppercase">
              Free account
            </p>
            <h1 className="mt-2 text-2xl font-bold text-heading">
              Create your Planner account
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="space-y-1.5 md:flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-heading">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 md:flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-heading">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-heading">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              className="mt-2 w-full rounded-xl bg-primary hover:bg-primary-dark disabled:bg-primary/60 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-primary hover:text-primary-dark font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:text-primary-dark font-medium">
              Privacy Policy
            </a>
            .
          </p>

          <p className="mt-4 text-center text-sm text-body">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:text-primary-dark font-semibold">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
