
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { Button, Select, TextInput } from '../../ui/atoms';

export const SearchBar = () => {
  const { cities, fetchCities, searchBuses } = useStore();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchBuses({ source: fromCity, destination: toCity, date });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-4 bg-white p-4 rounded-card shadow-md">
      <Select value={fromCity} onChange={(e) => setFromCity(e.target.value)} required>
        <option value="" disabled>From</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>{city.name}</option>
        ))}
      </Select>
      <Select value={toCity} onChange={(e) => setToCity(e.target.value)} required>
        <option value="" disabled>To</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>{city.name}</option>
        ))}
      </Select>
      <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <Button type="submit" variant="primary">Search Buses</Button>
    </form>
  );
};
