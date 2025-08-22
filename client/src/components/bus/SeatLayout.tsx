
import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/store';
import { Loader } from '../shared/Loader';
import type { Seat as SeatType } from '../../services/Api';

interface SeatLayoutProps {
  busId: string;
  travelDate?: string;
  onSeatsSelected: (seats: string[]) => void;
}

export const SeatLayout = ({ busId, travelDate, onSeatsSelected }: SeatLayoutProps) => {
  const { seats, fetchBusSeats, loading, error, resetBookingState, startNewBookingSession, selectedBus } = useStore();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    console.log('=== SEAT LAYOUT: Fetching seats automatically ===');
    console.log('Bus ID:', busId);
    console.log('Travel Date:', travelDate);
    
    if (busId && travelDate) {
      // Fetch seats automatically when component mounts or when busId/travelDate changes
      fetchBusSeats(busId, travelDate);
      setLastRefreshTime(new Date());
      
      // Clear selected seats for new booking session
      setSelectedSeats([]);
      console.log('Selected seats cleared for new booking session');
    }
  }, [busId, travelDate, fetchBusSeats]);

  // Auto-refresh seats (optional - user controlled)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(() => {
    // Load user preference from localStorage
    const saved = localStorage.getItem('seatLayout_autoRefresh');
    return saved === 'true';
  });
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  
  // Save user preference to localStorage
  const toggleAutoRefresh = () => {
    const newValue = !autoRefreshEnabled;
    setAutoRefreshEnabled(newValue);
    localStorage.setItem('seatLayout_autoRefresh', newValue.toString());
  };
  
  useEffect(() => {
    if (!autoRefreshEnabled || !busId || !travelDate) return;
    
    const interval = setInterval(() => {
      console.log('=== AUTO-REFRESH: Refreshing seats ===');
      fetchBusSeats(busId, travelDate);
      setLastRefreshTime(new Date());
    }, 30000); // Refresh every 30 seconds (only when enabled)
    
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, busId, travelDate, fetchBusSeats]);

  // Expose refresh method to parent component
  const refreshSeats = () => {
    console.log('=== MANUAL REFRESH: Refreshing seats ===');
    fetchBusSeats(busId, travelDate);
    setLastRefreshTime(new Date());
  };



  // Debug: Log seats when they change
  useEffect(() => {
    console.log('=== FRONTEND DEBUG: Seats received ===');
    console.log('Number of seats:', seats.length);
    console.log('Seats data:', seats);
    console.log('Available seats:', seats.filter(s => s.is_available).length);
    
    // Log each seat individually for debugging
    seats.forEach((seat, index) => {
      console.log(`Seat ${index + 1}:`, {
        id: seat.id,
        seat_no: seat.seat_no,
        seat_type: seat.seat_type,
        price: seat.price,
        is_available: seat.is_available,
        type: typeof seat.is_available
      });
    });
  }, [seats]);

  const handleSeatClick = (seat: SeatType) => {
    console.log('=== FRONTEND DEBUG: Seat clicked ===');
    console.log('Seat:', seat);
    console.log('Is available:', seat.is_available);
    
    if (!seat.is_available) {
      console.log('Seat not available, ignoring click');
      return;
    }

    console.log('Seat is available, toggling selection');
    setSelectedSeats((prev) => {
      if (prev.includes(seat.seat_no)) {
        console.log('Removing seat from selection:', seat.seat_no);
        return prev.filter((s) => s !== seat.seat_no);
      } else {
        console.log('Adding seat to selection:', seat.seat_no);
        return [...prev, seat.seat_no];
      }
    });
  };

  // Update parent component when selected seats change
  useEffect(() => {
    onSeatsSelected(selectedSeats);
  }, [selectedSeats, onSeatsSelected]);

  if (loading) return <Loader />;
  if (error) return (
    <div className="text-red-500 p-4 border border-red-300 rounded-lg bg-red-50">
      <h3 className="font-semibold mb-2">Error Loading Seats</h3>
      <p className="text-sm">{error}</p>
      <button 
        onClick={() => fetchBusSeats(busId, travelDate)}
        className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Select Your Seats</h2>
      </div>

      {/* Removed auto-refresh status UI */}

      {/* Error display */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Seat Selection</h3>
        {travelDate && (
          <p className="text-blue-600 text-sm">Travel Date: {travelDate}</p>
        )}
        <p className="text-blue-600 text-sm">Click on available seats to select them</p>
      </div>
      
      {/* Removed debug-only buttons: Refresh Seats, Reset Booking State, Start New Session */}

      {/* Clear Selected Seats button */}
      {selectedSeats.length > 0 && (
        <button 
          onClick={() => setSelectedSeats([])}
          className="mt-2 ml-2 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
        >
          Clear Selection
        </button>
      )}

      {/* Real-time fare counter */}
      <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
        <div className="flex justify-between items-center">
          <span className="text-blue-800 font-medium">Current Selection:</span>
          <div className="text-right">
            <span className="text-blue-600 text-sm">
              {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
            </span>
            {selectedSeats.length > 0 && (
              <div className="text-blue-800 font-bold text-lg">
                Total: ₹{selectedSeats.reduce((total, seatNo) => {
                  const seat = seats.find(s => s.seat_no === seatNo);
                  return total + (seat?.price || 0);
                }, 0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {seats.length > 0 ? (
        <div className="grid grid-cols-5 gap-2">
          {seats.map((seat) => {
            const isSelected = selectedSeats.includes(seat.seat_no);
            
            return (
              <div
                key={seat.seat_no}
                onClick={() => handleSeatClick(seat)}
                className={`p-2 border rounded-md text-center transition-all duration-200 ${
                  !seat.is_available
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600 border-gray-500'
                    : isSelected
                    ? 'bg-green-800 text-white border-green-900 cursor-pointer shadow-lg'
                    : 'bg-green-200 hover:bg-green-300 cursor-pointer border-green-400 hover:border-green-500 hover:shadow-md'
                }`}
                title={`${seat.seat_no} - ${seat.seat_type} - ₹${seat.price} - ${seat.is_available ? 'Available' : 'Booked'}`}
              >
                <div className="text-sm font-medium">{seat.seat_no}</div>
                <div className="text-xs text-gray-500">{seat.seat_type}</div>
                <div className="text-xs font-semibold">₹{seat.price}</div>
                <div className={`text-xs ${seat.is_available ? 'text-green-700' : 'text-gray-600'}`}>
                  {seat.is_available ? 'Available' : 'Booked'}
                </div>
                {isSelected && (
                  <div className="text-xs text-white font-bold mt-1">SELECTED</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No seats found for this bus
        </div>
      )}
    </div>
  );
};
