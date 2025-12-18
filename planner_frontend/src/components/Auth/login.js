import React from 'react';

const Login = ({ onLoginSuccess }) => {
  const handleSubmit = (event) => {
    event.preventDefault();

    if (onLoginSuccess) {
      onLoginSuccess();
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
              <a href="#" className="text-primary hover:text-primary-dark font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-primary hover:bg-primary-dark text-white py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              Log in
            </button>
          </form>

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

