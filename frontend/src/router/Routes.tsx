
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Layout } from '../components/layout/Layout';
import { LoginPage } from '../pages/LoginPage';
import { MyBookingsPage } from '../pages/MyBookingsPage';
import { PersonalInfoPage } from '../pages/PersonalInfoPage';
import { BusTicketsPage } from '../pages/BusTicketsPage';
import { SeatSelectionPage } from '../pages/SeatSelectionPage';
import { LandingPage } from '../pages/LandingPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Login page as default */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Landing page after login */}
      <Route path="/" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
      
      {/* My Details routes */}
      <Route
        path="/my-details"
        element={<ProtectedRoute><Layout /></ProtectedRoute>}
      >
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="personal-info" element={<PersonalInfoPage />} />
      </Route>
      
      {/* Seat selection for buses */}
      <Route
        path="/bus/:busId/seats"
        element={<ProtectedRoute><SeatSelectionPage /></ProtectedRoute>}
      />
      
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};
