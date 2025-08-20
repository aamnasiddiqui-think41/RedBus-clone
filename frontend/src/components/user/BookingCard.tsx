import React from 'react';
import type { Booking } from '../../services/Api';
import { Card } from '../shared/Card';

interface BookingCardProps {
  booking: Booking;
}

export const BookingCard = ({ booking }: BookingCardProps) => {
  return (
    <Card>
      <div className="flex justify-between">
        <div className="font-bold">{booking.operator}</div>
        <div className={`text-sm font-bold ${booking.status === 'CONFIRMED' ? 'text-green-500' : 'text-red-500'}`}>
          {booking.status}
        </div>
      </div>
      <div className="text-sm text-gray-600">
        {booking.date} | {booking.seats.join(', ')}
      </div>
      <div className="text-right font-bold text-lg">₹{booking.total_amount}</div>
    </Card>
  );
};
