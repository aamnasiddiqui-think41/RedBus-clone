
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SeatLayout } from '../components/bus/SeatLayout';
import { BookingSummary } from '../components/bus/BookingSummary';
import { Navbar } from '../components/shared/Navbar';
import { useStore } from '../store/store';
import * as Api from '../services/Api';
import { Modal } from '../components/shared/Modal';
import { Button } from '../ui/atoms';

export const SeatSelectionPage = () => {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { createBooking, selectedBus, selectBus, buses, token, searchParams } = useStore();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isBookingSuccessModalOpen, setIsBookingSuccessModalOpen] = useState(false);
  const [travelDate, setTravelDate] = useState<string>('');
  const [seatLayoutKey, setSeatLayoutKey] = useState(0); // Force re-render of SeatLayout

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

  // Get travel date from search params or location state
  useEffect(() => {
    console.log('=== SEAT SELECTION PAGE DEBUG ===');
    console.log('Search params:', searchParams);
    console.log('Location state:', location.state);
    
    if (searchParams?.date) {
      console.log('Setting travel date from search params:', searchParams.date);
      setTravelDate(searchParams.date);
    } else if (location.state?.travelDate) {
      console.log('Setting travel date from location state:', location.state.travelDate);
      setTravelDate(location.state.travelDate);
    } else {
      console.log('No travel date found, using default');
      setTravelDate('2025-09-01'); // Set a default date
    }
  }, [searchParams, location.state]);

  // Debug: Log when travelDate changes
  useEffect(() => {
    console.log('Travel date changed to:', travelDate);
  }, [travelDate]);

  const handleConfirmBooking = async () => {
    if (!token) {
      alert('You must be logged in to book tickets.');
      return;
    }

    if (selectedBus && selectedSeats.length > 0) {
      try {
        await createBooking({
          bus_id: selectedBus.id,
          travel_date: travelDate, // Use travel_date instead of date
          seats: selectedSeats,
          passenger_details: [], // This should be collected from the user
          contact: { phone: '', email: '' }, // This should be collected from the user
        });
        
        // Only show success modal if no error occurred (API returned 200 OK)
        const { error } = useStore.getState();
        if (!error) {
          // Force refresh of seat layout to show updated availability
          setSeatLayoutKey(prev => prev + 1);
          setIsBookingSuccessModalOpen(true);
        }
      } catch (error) {
        // Error is already handled by the store, but we can add additional handling here if needed
        console.error('Booking failed:', error);
      }
    }
  };

  const handleCloseSuccessModal = () => {
    setIsBookingSuccessModalOpen(false);
    navigate('/my-details/bookings');
  };

  if (!busId) return <div>Invalid bus ID</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar showNavigation={true} />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <SeatLayout 
              key={seatLayoutKey}
              busId={busId} 
              onSeatsSelected={setSelectedSeats} 
              travelDate={travelDate}
            />
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
      </div>
    </div>
  );
};
