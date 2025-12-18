import React from 'react';

const Header = ({ onSignupClick, onLoginClick, onLogoClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={onLogoClick}
            className="flex-shrink-0 focus:outline-none"
          >
            <h1 className="text-2xl font-bold text-primary">
              PlannerLogo
            </h1>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="#home"
              className="text-body hover:text-primary transition-colors duration-200 font-medium"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-body hover:text-primary transition-colors duration-200 font-medium"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-body hover:text-primary transition-colors duration-200 font-medium"
            >
              About
            </a>
            <a
              href="#pricing"
              className="text-body hover:text-primary transition-colors duration-200 font-medium"
            >
              Pricing
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onLoginClick}
              className="text-body hover:text-primary transition-colors duration-200 font-medium"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onSignupClick}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Signup
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
