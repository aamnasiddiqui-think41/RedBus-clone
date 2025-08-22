
import { useEffect } from 'react';
import { useStore } from '../../store/store';
import { BookingCard } from './BookingCard';
import { Loader } from '../shared/Loader'; // Assuming a generic Loader component exists

export const BookingsList = () => {
  const { myBookings, fetchBookings, loading, error, token, user } = useStore();

  useEffect(() => {
    console.log('=== BOOKINGS LIST: Fetching bookings ===');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('User ID:', user?.id);
    
    if (token && user) {
      console.log('Fetching bookings for user:', user.id);
      fetchBookings();
    } else {
      console.log('No token or user, cannot fetch bookings');
    }
  }, [token, user]); // Remove fetchBookings from dependencies to prevent infinite loop

  if (loading) return <Loader />;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="text-red-800 font-semibold mb-2">Error Loading Bookings</h3>
      <p className="text-red-700 text-sm">{error}</p>
      <button 
        onClick={() => fetchBookings()}
        className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );
  
  if (!myBookings || myBookings.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <h3 className="text-blue-800 font-semibold text-lg mb-2">No Bookings Found</h3>
        <p className="text-blue-700 mb-4">You haven't made any bookings yet.</p>
        <p className="text-blue-600 text-sm">Start by searching for buses and booking your first trip!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myBookings.map((booking) => (
        <BookingCard key={booking.booking_id} booking={booking} />
      ))}
    </div>
  );
};
