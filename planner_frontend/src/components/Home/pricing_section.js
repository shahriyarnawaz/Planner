import React from 'react';

const PricingSection = () => {
  const features = [
    'Unlimited Tasks',
    'Smart Reminders',
    'Templates & Routines',
    'Productivity Insights',
    'Works on All Devices',
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-heading mb-4">
            Free Forever
          </h2>
          <p className="text-xl text-body">
            100% Free. No Credit Card. No Hidden Fees.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Features */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-heading mb-6">
              Everything Included
            </h3>
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-white rounded-lg border border-background-dark hover:border-primary hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-6 h-6 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg text-heading font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Right: CTA Card */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white border-2 border-primary rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-block bg-accent-gold text-text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                  LIMITED TIME OFFER
                </div>
                <div className="mb-4">
                  <span className="text-6xl font-bold text-heading">$0</span>
                  <span className="text-2xl text-muted">/forever</span>
                </div>
                <p className="text-body">
                  No credit card required
                </p>
              </div>

              <button className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl mb-6">
                Get Started Free
              </button>

              <div className="space-y-3 pt-6 border-t border-background-dark">
                <div className="flex items-center gap-3 text-sm text-body">
                  <svg className="w-5 h-5 text-accent-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Instant access to all features</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-body">
                  <svg className="w-5 h-5 text-accent-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No payment information needed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-body">
                  <svg className="w-5 h-5 text-accent-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cancel anytime (but why would you?)</span>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted mt-6">
              Trusted by 10,000+ productive users worldwide
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
