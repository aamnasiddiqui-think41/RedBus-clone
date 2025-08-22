

import { useStore } from '../../store/store';
import { BusCard } from './BusCard';
import { Loader } from '../shared/Loader';
import { EmptyState } from '../shared/EmptyState';
import type { Bus } from '../../services/Api';

interface BusListProps {
  onSelectBus: (bus: Bus) => void;
}

export const BusList = ({ onSelectBus }: BusListProps) => {
  const { buses, loading, error } = useStore();

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;
  if (!buses || buses.length === 0) return <EmptyState>No buses found for this route.</EmptyState>;

  return (
    <div className="space-y-4">
      {buses.map((bus) => (

<BusCard key={bus.id} bus={bus} onSelectBus={onSelectBus} />
      ))}
    </div>
  );
};
