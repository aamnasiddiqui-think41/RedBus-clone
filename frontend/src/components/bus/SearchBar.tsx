
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { Button, Select, TextInput } from '../../ui/atoms';

export const SearchBar = () => {
  const { cities, fetchCities, searchBuses, searchParams } = useStore();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // Pre-fill search form with parameters from landing page
  useEffect(() => {
    if (searchParams) {
      // Find city IDs by name (you might want to improve this logic)
      const fromCityObj = cities.find(city => 
        city.name.toLowerCase().includes(searchParams.from.toLowerCase())
      );
      const toCityObj = cities.find(city => 
        city.name.toLowerCase().includes(searchParams.to.toLowerCase())
      );
      
      if (fromCityObj) setFromCity(fromCityObj.id);
      if (toCityObj) setToCity(toCityObj.id);
      
      // Convert date format if needed
      if (searchParams.date) {
        // Convert "20 Aug, 2025" to "2025-08-20" format
        const dateParts = searchParams.date.split(' ');
        if (dateParts.length === 3) {
          const day = dateParts[0];
          const month = dateParts[1];
          const year = dateParts[2];
          const monthMap: { [key: string]: string } = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
          };
          const monthNum = monthMap[month];
          if (monthNum) {
            setDate(`${year}-${monthNum}-${day.padStart(2, '0')}`);
          }
        }
      }
    }
  }, [searchParams, cities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchData: any = {
      from_city_id: fromCity,
      to_city_id: toCity
    };
    
    // Only add date if it's provided
    if (date) {
      searchData.date = date;
    }
    
    searchBuses(searchData);
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
      <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Button type="submit" variant="primary">Search Buses</Button>
    </form>
  );
};
