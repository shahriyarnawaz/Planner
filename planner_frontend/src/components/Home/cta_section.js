import React from 'react';

const CTASection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary to-primary-dark">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to take control of your day?
        </h2>
        
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Start organizing tasks, building routines, and staying productive — completely free.
        </p>
        
        <div className="flex flex-col items-center space-y-6">
          <button className="bg-white hover:bg-gray-100 text-primary font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl">
            Get Started Free
          </button>
          
          <p className="text-white/80 text-sm">
            No credit card required
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
