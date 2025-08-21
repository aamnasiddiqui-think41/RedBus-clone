
import React, { useEffect } from 'react';
import { useStore } from '../../store/store';
import { BookingCard } from './BookingCard';
import { Loader } from '../shared/Loader'; // Assuming a generic Loader component exists
import { EmptyState } from '../shared/EmptyState'; // Assuming a generic EmptyState component exists

export const BookingsList = () => {
  const { myBookings, fetchBookings, loading, error, token, user } = useStore();

  useEffect(() => {
    console.log('=== BOOKINGS LIST DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('User ID:', user?.id);
    
    if (token && user) {
      console.log('Fetching bookings for user:', user.id);
      fetchBookings();
    } else {
      console.log('No token or user, cannot fetch bookings');
    }
  }, [fetchBookings, token, user]);

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
      {/* Debug section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-yellow-800 font-semibold mb-2">🔍 Debug Info</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>User ID:</strong> {user?.id || 'Not set'}</p>
            <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
            <p><strong>Bookings Count:</strong> {myBookings.length}</p>
          </div>
          <div>
            <button 
              onClick={() => fetchBookings()}
              className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
            >
              🔄 Refresh Bookings
            </button>
          </div>
        </div>
      </div>
      
      {/* Bookings list */}
      {myBookings.map((booking) => (
        <BookingCard key={booking.booking_id} booking={booking} />
      ))}
    </div>
  );
};
