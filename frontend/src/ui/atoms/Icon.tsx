
import React from 'react';

// --- IconWrapper ---
type IconWrapperProps = {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export const IconWrapper = ({ children, size = 'md' }: IconWrapperProps) => {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return <div className={`flex items-center justify-center ${sizeMap[size]}`}>{children}</div>;
};
