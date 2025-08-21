import React from 'react';
import { BookingsList } from '../components/user/BookingsList';

export const MyBookingsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <BookingsList />
    </div>
  );
};
