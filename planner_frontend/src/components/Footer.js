import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white py-10 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <div className="text-body mb-4 md:mb-0">
            {currentYear} Planner App. All rights reserved.
          </div>
          
          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
            <a href="/privacy" className="text-body hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-body hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="/contact" className="text-body hover:text-primary transition-colors">
              Contact Us
            </a>
          </nav>
        </div>
        
        {/* Mobile Copyright */}
        <div className="mt-8 text-center text-muted text-sm md:hidden">
          {currentYear} Planner App
        </div>
      </div>
    </footer>
  );
};

export default Footer;