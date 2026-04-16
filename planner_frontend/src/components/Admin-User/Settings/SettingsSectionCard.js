import React from 'react';

const SettingsSectionCard = ({ title, description, children }) => {
  return (
    <section className="rounded-2xl bg-white border border-background-dark shadow-sm p-5">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-heading">{title}</h2>
        {description && <p className="text-xs text-text-secondary mt-1">{description}</p>}
      </div>
      <div className="border-t border-background-dark/60 mb-3" />
      {children}
    </section>
  );
};

export default SettingsSectionCard;
