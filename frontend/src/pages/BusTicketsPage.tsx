
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/bus/SearchBar';
import { BusList } from '../components/bus/BusList';
import { useStore } from '../store/store';
import type { Bus } from '../services/Api';

export const BusTicketsPage = () => {
  const navigate = useNavigate();
  const selectBus = useStore((state) => state.selectBus);

  const handleSelectBus = (bus: Bus) => {
    selectBus(bus);
    navigate(`/bus-tickets/${bus.id}/seats`);
  };

  return (
    <div>
      <SearchBar />
      <div className="mt-8">
        <BusList onSelectBus={handleSelectBus} />
      </div>
    </div>
  );
};

