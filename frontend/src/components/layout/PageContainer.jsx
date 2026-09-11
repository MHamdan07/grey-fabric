import React from 'react';

export const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`p-8 max-w-[1600px] mx-auto space-y-6 ${className}`}>
      {children}
    </div>
  );
};
