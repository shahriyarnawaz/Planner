import React from 'react';

const AboutSection = () => {
  const highlights = [
    'Smart reminders',
    'Routine planning',
    'Productivity insights',
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-heading mb-4">
            About Us
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Illustration/Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-light to-primary rounded-2xl p-12 shadow-2xl">
              {/* Placeholder SVG Illustration */}
              <svg
                className="w-full h-auto text-white"
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Calendar/Planner Illustration */}
                <rect x="50" y="40" width="300" height="220" rx="12" fill="white" fillOpacity="0.2" />
                <rect x="70" y="60" width="260" height="40" rx="8" fill="white" fillOpacity="0.3" />
                
                {/* Task items */}
                <rect x="70" y="120" width="200" height="20" rx="4" fill="white" fillOpacity="0.9" />
                <circle cx="90" cy="130" r="6" fill="currentColor" />
                
                <rect x="70" y="160" width="180" height="20" rx="4" fill="white" fillOpacity="0.9" />
                <circle cx="90" cy="170" r="6" fill="currentColor" />
                
                <rect x="70" y="200" width="220" height="20" rx="4" fill="white" fillOpacity="0.9" />
                <circle cx="90" cy="210" r="6" fill="currentColor" />
                
                {/* Clock icon */}
                <circle cx="320" cy="180" r="40" fill="white" fillOpacity="0.3" />
                <circle cx="320" cy="180" r="30" fill="white" fillOpacity="0.5" />
                <line x1="320" y1="180" x2="320" y2="160" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line x1="320" y1="180" x2="335" y2="180" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-gold opacity-20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-warning opacity-20 rounded-full blur-xl"></div>
          </div>

          {/* Right: Content */}
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-heading mb-6">
              Who We Are
            </h3>
            
            <p className="text-lg text-body leading-relaxed mb-8">
              We built this smart planner to help people manage time better and reduce mental overload. 
              Our mission is to empower individuals to take control of their schedules with intelligent 
              automation and actionable insights.
            </p>

            {/* Highlights with checkmarks */}
            <div className="space-y-4">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-accent-gold rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-heading">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>

            {/* Optional CTA */}
            <div className="mt-10">
              <button className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
