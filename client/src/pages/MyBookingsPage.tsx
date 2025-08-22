import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { BookingsList } from '../components/user/BookingsList';
import { Loader } from '../components/shared/Loader';

export const MyBookingsPage = () => {
  const { token, user, isInitializing } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're sure there's no session (after initialization)
    if (!isInitializing && !token && !user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [token, user, isInitializing, navigate]);

  // Wait for auth initialization to complete
  if (isInitializing) {
    return <Loader />;
  }

  // If no session after initialization, redirect to login
  if (!token || !user) {
    // Don't call navigate here - let useEffect handle it
    return <Loader />;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Welcome back, {user.name}! Here are your travel bookings.</p>
        </div>
        
        <BookingsList />
      </div>
    </div>
  );
};
