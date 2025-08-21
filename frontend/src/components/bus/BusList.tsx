
import React from 'react';
import { useStore } from '../../store/store';
import { BusCard } from './BusCard';
import { Loader } from '../shared/Loader';
import { EmptyState } from '../shared/EmptyState';
import type { Bus } from '../../services/Api';

interface BusListProps {
  onSelectBus: (bus: Bus) => void;
}

export const BusList = ({ onSelectBus }: BusListProps) => {
  const { buses, loading, error, searchMessage } = useStore();

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="space-y-4">
      {/* Show search message if available */}
      {searchMessage && (
        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">{searchMessage}</p>
        </div>
      )}
      
      {/* Show buses or empty state */}
      {!buses || buses.length === 0 ? (
        <EmptyState>
          {searchMessage || "No buses found for this route."}
        </EmptyState>
      ) : (
        buses.map((bus) => (
          <BusCard key={bus.id} bus={bus} onSelectBus={onSelectBus} />
        ))
      )}
    </div>
  );
};
