
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
      {/* Manual refresh button */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Select Your Seats</h2>
        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Auto-refresh:</label>
            <button
              onClick={toggleAutoRefresh}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                autoRefreshEnabled 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
              title="Toggle automatic seat availability updates"
            >
              {autoRefreshEnabled ? 'ON' : 'OFF'}
            </button>
            {autoRefreshEnabled && (
              <span className="text-xs text-green-600">Every 30s</span>
            )}
          </div>
          
          {/* Info text */}
          <div className="text-xs text-gray-500">
            Auto-refresh keeps seat availability up-to-date
          </div>
          
          {/* Manual refresh button */}
          <button
            onClick={refreshSeats}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh Seats
          </button>
        </div>
      </div>

      {/* Refresh Status */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">Last refresh:</span>
            <span className="ml-2">
              {lastRefreshTime 
                ? lastRefreshTime.toLocaleTimeString() 
                : 'Never'
              }
            </span>
          </div>
          {autoRefreshEnabled && (
            <div>
              <span className="font-medium">Next auto-refresh:</span>
              <span className="ml-2">
                {lastRefreshTime 
                  ? new Date(lastRefreshTime.getTime() + 30000).toLocaleTimeString()
                  : 'In 30s'
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Seat Selection</h3>
        {travelDate && (
          <p className="text-blue-600 text-sm">Travel Date: {travelDate}</p>
        )}
        <p className="text-blue-600 text-sm">Click on available seats to select them</p>
        <p className="text-red-600 text-sm">DEBUG: {seats.length} seats loaded</p>
        
        {/* Selected seats summary */}
        {selectedSeats.length > 0 && (
          <div className="mt-3 p-4 bg-green-100 border-2 border-green-300 rounded-lg shadow-md">
            <h4 className="text-green-800 font-bold text-lg mb-2">🎫 Booking Summary</h4>
            <div className="space-y-2">
              <p className="text-green-800 font-medium">
                Selected Seats: <span className="bg-green-200 px-2 py-1 rounded font-bold">{selectedSeats.join(', ')}</span>
              </p>
              <p className="text-green-700 font-medium">
                Total Seats: <span className="bg-green-200 px-2 py-1 rounded font-bold">{selectedSeats.length}</span>
              </p>
              <p className="text-green-700 font-medium">
                Estimated Cost: <span className="bg-green-200 px-3 py-1 rounded font-bold text-lg">₹{selectedSeats.reduce((total, seatNo) => {
                  const seat = seats.find(s => s.seat_no === seatNo);
                  return total + (seat?.price || 0);
                }, 0)}</span>
              </p>
            </div>
          </div>
        )}
        
        {/* Manual refresh button */}
        <button 
          onClick={() => {
            console.log('=== MANUAL REFRESH: Refreshing seats ===');
            fetchBusSeats(busId, travelDate);
          }}
          disabled={loading}
          className={`mt-2 px-3 py-1 text-white text-xs rounded ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? '⏳ Refreshing...' : '🔄 Refresh Seats'}
        </button>
        
        {/* Debug button */}
        <button 
          onClick={() => {
            console.log('=== MANUAL DEBUG: Current state ===');
            console.log('Bus ID:', busId);
            console.log('Travel Date:', travelDate);
            console.log('Seats in store:', seats);
            console.log('Loading:', loading);
            console.log('Error:', error);
            console.log('Selected seats:', selectedSeats);
          }}
          className="mt-2 ml-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Debug: Current State
        </button>
        
        {/* Store state debug button */}
        <button 
          onClick={() => {
            const store = useStore.getState();
            console.log('=== STORE STATE DEBUG ===');
            console.log('Full store state:', store);
            console.log('Store seats:', store.seats);
            console.log('Store loading:', store.loading);
            console.log('Store error:', store.error);
          }}
          className="mt-2 ml-2 px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
        >
          Debug: Store State
        </button>

        {/* Reset Booking State button */}
        <button 
          onClick={resetBookingState}
          className="mt-2 ml-2 px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
        >
          Reset Booking State
        </button>

        {/* Start New Booking Session button */}
        {selectedBus && (
          <button 
            onClick={() => startNewBookingSession(selectedBus)}
            className="mt-2 ml-2 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Start New Session
          </button>
        )}

        {/* Clear Selected Seats button */}
        {selectedSeats.length > 0 && (
          <button 
            onClick={() => setSelectedSeats([])}
            className="mt-2 ml-2 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
          >
            Clear Selection
          </button>
        )}
      </div>
      
      {/* Real-time fare counter */}
      <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
        <div className="flex justify-between items-center">
          <span className="text-blue-800 font-medium">Current Selection:</span>
          <div className="text-right">
            <span className="text-blue-600 text-sm">
              {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
            </span>
            {selectedSeats.length > 0 && (
              <div className="text-blue-800 font-bold text-lg animate-pulse">
                Total: ₹{selectedSeats.reduce((total, seatNo) => {
                  const seat = seats.find(s => s.seat_no === seatNo);
                  return total + (seat?.price || 0);
                }, 0)}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Test Data Display */}
      <div className="bg-purple-100 p-3 rounded-lg border border-purple-300">
        <h4 className="font-medium text-purple-800 mb-2">🧪 Test Data:</h4>
        <p className="text-purple-700 text-sm">API Response: {seats.length} seats received</p>
        <p className="text-purple-700 text-sm">Available: {seats.filter(s => s.is_available).length}</p>
        <p className="text-purple-700 text-sm">Unavailable: {seats.filter(s => !s.is_available).length}</p>
        <p className="text-purple-700 text-sm">Selected: {selectedSeats.length}</p>
        
        {/* Show first few seats for debugging */}
        {seats.length > 0 && (
          <div className="mt-2">
            <p className="text-purple-700 text-sm font-medium">First 3 seats:</p>
            <div className="space-y-1">
              {seats.slice(0, 3).map((seat, index) => (
                <div key={index} className="text-xs bg-purple-200 p-1 rounded">
                  {seat.seat_no}: {seat.seat_type} - ₹{seat.price} - Available: {seat.is_available ? '✅' : '❌'}
                </div>
              ))}
            </div>
          </div>
        )}
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
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600 border-gray-500' // Grey for unavailable
                    : isSelected
                    ? 'bg-green-800 text-white border-green-900 cursor-pointer shadow-lg transform scale-105' // Dark green for selected
                    : 'bg-green-200 hover:bg-green-300 cursor-pointer border-green-400 hover:border-green-500 hover:shadow-md' // Light green for available
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
      
      {/* Debug info */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800">Debug Info:</h4>
        
        {/* Color Legend */}
        <div className="mb-3 p-3 bg-yellow-100 rounded border border-yellow-300">
          <h5 className="font-medium text-yellow-800 mb-2">🎨 Color Scheme:</h5>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
              <span>Light Green = Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-800 border border-green-900 rounded"></div>
              <span>Dark Green = Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded"></div>
              <span>Grey = Unavailable</span>
            </div>
          </div>
        </div>
        
        <p>Total seats: {seats.length}</p>
        <p>Available seats: {seats.filter(s => s.is_available).length}</p>
        <p>Selected seats: {selectedSeats.join(', ') || 'None'}</p>
        <p>Bus ID: {busId}</p>
        <p>Travel Date: {travelDate || 'Not set'}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        
        {/* Raw seats data for debugging */}
        <details className="mt-3">
          <summary className="cursor-pointer font-medium text-yellow-700">Raw Seats Data</summary>
          <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(seats, null, 2)}
          </pre>
        </details>
        
        {/* Selected seats details */}
        {selectedSeats.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer font-medium text-yellow-700">Selected Seats Details</summary>
            <div className="mt-2 space-y-1">
              {selectedSeats.map(seatNo => {
                const seat = seats.find(s => s.seat_no === seatNo);
                return seat ? (
                  <div key={seatNo} className="text-xs bg-yellow-100 p-2 rounded">
                    <strong>{seat.seat_no}</strong> - {seat.seat_type} - ₹{seat.price}
                  </div>
                ) : null;
              })}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};
