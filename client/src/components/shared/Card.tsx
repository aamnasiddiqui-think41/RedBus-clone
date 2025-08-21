
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white shadow-md rounded-card p-4 ${className}`}>
      {children}
    </div>
  );
};
