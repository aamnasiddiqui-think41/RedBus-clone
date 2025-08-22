
import type { Booking } from '../../services/Api';
import { Card } from '../shared/Card';
import { useStore } from '../../store/store';

interface BookingCardProps {
  booking: Booking;
}

export const BookingCard = ({ booking }: BookingCardProps) => {
  const { cancelBooking, loading } = useStore();

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      await cancelBooking(booking.booking_id);
    }
  };

  return (
    <Card>
      <div className="flex justify-between">
        <div className="font-bold">{booking.bus_name}</div>
        <div className={`text-sm font-bold ${booking.status === 'CONFIRMED' ? 'text-green-500' : 'text-red-500'}`}>
          {booking.status}
        </div>
      </div>
      <div className="text-sm text-gray-600">
        {booking.from_city} → {booking.to_city}
      </div>
      <div className="text-sm text-gray-600">
        {booking.date} | {booking.seats.join(', ')}
      </div>
      <div className="flex justify-between items-center">
        <div className="font-bold text-lg">₹{booking.amount}</div>
        {booking.status === 'CONFIRMED' && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </Card>
  );
};
