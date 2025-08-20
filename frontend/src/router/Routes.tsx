
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Layout } from '../components/layout/Layout';
import { LoginPage } from '../pages/LoginPage';
import { MyBookingsPage } from '../pages/MyBookingsPage';
import { PersonalInfoPage } from '../pages/PersonalInfoPage';
import { BusTicketsPage } from '../pages/BusTicketsPage';
import { SeatSelectionPage } from '../pages/SeatSelectionPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/my-details"
        element={<ProtectedRoute><Layout /></ProtectedRoute>}
      >
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="personal-info" element={<PersonalInfoPage />} />
      </Route>
      <Route
        path="/bus-tickets"
        element={<ProtectedRoute><Layout /></ProtectedRoute>}
      >
        <Route index element={<BusTicketsPage />} />
        <Route path=":busId/seats" element={<SeatSelectionPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};
