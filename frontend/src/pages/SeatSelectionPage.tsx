
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SeatLayout } from '../components/bus/SeatLayout';
import { BookingSummary } from '../components/bus/BookingSummary';
import { useStore } from '../store/store';
import * as Api from '../services/Api';
import { Modal } from '../components/shared/Modal';
import { Button } from '../ui/atoms';

export const SeatSelectionPage = () => {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { createBooking, selectedBus, selectBus, buses, token } = useStore();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isBookingSuccessModalOpen, setIsBookingSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedBus && busId) {
      if (location.state?.bus) {
        selectBus(location.state.bus);
        return;
      }
      const busFromStore = buses.find((b: Api.Bus) => b.id === busId);
      if (busFromStore) {
        selectBus(busFromStore);
      }
    }
  }, [selectedBus, busId, buses, selectBus, location.state]);

  const handleConfirmBooking = async () => {
    if (!token) {
      alert('You must be logged in to book tickets.');
      return;
    }

    if (selectedBus && selectedSeats.length > 0) {
      await createBooking({
        bus_id: selectedBus.id,
        date: '2025-09-01', // This should come from the search query
        seats: selectedSeats,
        passenger_details: [], // This should be collected from the user
        contact: { phone: '', email: '' }, // This should be collected from the user
      });
      setIsBookingSuccessModalOpen(true);
    }
  };

  const handleCloseSuccessModal = () => {
    setIsBookingSuccessModalOpen(false);
    navigate('/my-details/bookings');
  };

  if (!busId) return <div>Invalid bus ID</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <SeatLayout busId={busId} onSeatsSelected={setSelectedSeats} />
        </div>
        <div>
          <BookingSummary selectedSeats={selectedSeats} onConfirmBooking={handleConfirmBooking} />
        </div>
      </div>

      <Modal isOpen={isBookingSuccessModalOpen} onClose={handleCloseSuccessModal}>
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Successful!</h2>
          <p className="text-gray-600 mb-6">Your tickets have been confirmed.</p>
          <Button onClick={handleCloseSuccessModal} variant="primary">
            View My Bookings
          </Button>
        </div>
      </Modal>
    </>
  );
};
