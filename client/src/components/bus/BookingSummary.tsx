

import { useStore } from '../../store/store';
import { Button } from '../../ui/atoms';
import { Card } from '../shared/Card';

interface BookingSummaryProps {
  selectedSeats: string[];
  onConfirmBooking: () => void;
}

export const BookingSummary = ({ selectedSeats, onConfirmBooking }: BookingSummaryProps) => {
  const { selectedBus } = useStore();

  if (!selectedBus) return null;

  const totalFare = selectedSeats.length * selectedBus.fare;

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Booking Summary</h2>
      <div className="space-y-2">
        <div>
          <span className="font-semibold">Bus:</span> {selectedBus.operator}
        </div>
        <div>
          <span className="font-semibold">Seats:</span> {selectedSeats.join(', ')}
        </div>
        <div>
          <span className="font-semibold">Total Fare:</span> ₹{totalFare}
        </div>
      </div>
      <Button
        onClick={onConfirmBooking}
        variant="primary"
        className="mt-4 w-full"
        disabled={selectedSeats.length === 0}
      >
        Confirm Booking
      </Button>
    </Card>
  );
};
