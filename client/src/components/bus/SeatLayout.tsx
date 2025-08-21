
import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/store';
import { Loader } from '../shared/Loader';
import type { Seat as SeatType } from '../../services/Api';

interface SeatLayoutProps {
  busId: string;
  onSeatsSelected: (seats: string[]) => void;
}

export const SeatLayout = ({ busId, onSeatsSelected }: SeatLayoutProps) => {
  const { seats, fetchBusSeats, loading, error } = useStore();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    fetchBusSeats(busId);
  }, [busId, fetchBusSeats]);

  const handleSeatClick = (seat: SeatType) => {
    if (!seat.available) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seat.seat_no)) {
        return prev.filter((s) => s !== seat.seat_no);
      } else {
        return [...prev, seat.seat_no];
      }
    });
  };

  useEffect(() => {
    onSeatsSelected(selectedSeats);
  }, [selectedSeats, onSeatsSelected]);

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-5 gap-2">
      {seats.map((seat) => (
        <div
          key={seat.seat_no}
          onClick={() => handleSeatClick(seat)}
          className={`p-2 border rounded-md text-center cursor-pointer ${
            !seat.available
              ? 'bg-gray-300 cursor-not-allowed'
              : selectedSeats.includes(seat.seat_no)
              ? 'bg-primary text-white'
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          {seat.seat_no}
        </div>
      ))}
    </div>
  );
};
