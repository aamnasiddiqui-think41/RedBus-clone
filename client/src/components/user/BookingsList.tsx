
import React, { useEffect } from 'react';
import { useStore } from '../../store/store';
import { BookingCard } from './BookingCard';
import { Loader } from '../shared/Loader'; // Assuming a generic Loader component exists
import { EmptyState } from '../shared/EmptyState'; // Assuming a generic EmptyState component exists

export const BookingsList = () => {
  const { myBookings, fetchBookings, loading, error } = useStore();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;
  if (!myBookings || myBookings.length === 0) return <EmptyState>No bookings found.</EmptyState>;

  return (
    <div className="space-y-4">
      {myBookings.map((booking) => (
        <BookingCard key={booking.booking_id} booking={booking} />
      ))}
    </div>
  );
};
