

import type { Bus } from '../../services/Api';
import { Button } from '../../ui/atoms';
import { Card } from '../shared/Card';

interface BusCardProps {
  bus: Bus;
  onSelectBus: (bus: Bus) => void;
}

export const BusCard = ({ bus, onSelectBus }: BusCardProps) => {
  return (
    <Card>
      <div className="grid grid-cols-5 gap-4 items-center">
        <div className="col-span-2">
          <div className="font-bold">{bus.operator}</div>
          <div className="text-sm text-gray-500">{bus.bus_type}</div>
        </div>
        <div>
          <div className="font-bold">{bus.departure_time}</div>
          <div className="text-sm text-gray-500">{/* Start location */}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">{bus.duration}</div>
        </div>
        <div>
          <div className="font-bold">{bus.arrival_time}</div>
          <div className="text-sm text-gray-500">{/* End location */}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">₹{bus.fare}</div>
          <div className="text-sm text-gray-500">{bus.available_seats} seats left</div>
          <Button onClick={() => onSelectBus(bus)} variant="secondary" className="mt-2">
            Select Seats
          </Button>
        </div>
      </div>
    </Card>
  );
};
