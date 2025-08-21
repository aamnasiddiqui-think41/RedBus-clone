
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchBar } from '../components/bus/SearchBar';
import { BusList } from '../components/bus/BusList';
import { useStore } from '../store/store';
import type { Bus } from '../services/Api';

export const BusTicketsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectBus = useStore((state) => state.selectBus);
  const setSearchParams = useStore((state) => state.setSearchParams);

  // Handle search parameters from landing page
  useEffect(() => {
    if (location.state) {
      const { from, to, date } = location.state as { from: string; to: string; date: string };
      if (from && to) {
        setSearchParams({ from, to, date });
      }
    }
  }, [location.state, setSearchParams]);

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

