
import React from 'react';

// --- Container ---
type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export const Container = ({ children, className = '' }: ContainerProps) => {
  return <div className={`container ${className}`}>{children}</div>;
};

// --- Divider ---
export const Divider = () => {
  return <hr className="border-t border-border" />;
};

// --- Spacer ---
type SpacerProps = {
  size: 'sm' | 'md' | 'lg';
  axis?: 'vertical' | 'horizontal';
};

export const Spacer = ({ size, axis = 'vertical' }: SpacerProps) => {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const className = axis === 'vertical' ? `h-${sizeMap[size].split(' ')[0].slice(2)}` : `w-${sizeMap[size].split(' ')[1].slice(2)}`;

  return <div className={className} />;
};
