import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { BookingsList } from '../components/user/BookingsList';
import { Loader } from '../components/shared/Loader';

export const MyBookingsPage = () => {
  const { token, user, loading } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('=== MY BOOKINGS PAGE DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('User ID:', user?.id);
    
    if (!token || !user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [token, user, navigate]);

  if (!token || !user) {
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
