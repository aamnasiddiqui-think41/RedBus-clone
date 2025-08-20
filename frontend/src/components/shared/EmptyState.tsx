
import React from 'react';

interface EmptyStateProps {
  children: React.ReactNode;
}

export const EmptyState = ({ children }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">{children}</p>
    </div>
  );
};
