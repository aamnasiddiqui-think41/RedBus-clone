import uuid
from datetime import date

from app.services.bus_service import BusService


class DummySeat:
    def __init__(self, id, seat_no, seat_type, price):
        self.id = id
        self.seat_no = seat_no
        self.seat_type = seat_type
        self.price = price


class DummyBooking:
    def __init__(self, id, bus_id, d, status):
        self.id = id
        self.bus_id = bus_id
        self.date = d
        self.status = status


class DummyBookingSeat:
    def __init__(self, booking_id, seat_id):
        self.booking_id = booking_id
        self.seat_id = seat_id


class DummyDB:
    def __init__(self, seats=None, bookings=None, booking_seats=None, buses=None):
        self._seats = seats or []
        self._bookings = bookings or []
        self._booking_seats = booking_seats or []
        self._buses = buses or []

    def query(self, model):
        class Q:
            def __init__(self, outer, model):
                self.outer = outer
                self.model = model
                self._filter_args = None
            def filter(self, *args, **kwargs):
                self._filter_args = args
                return self
            def all(self):
                if self.model.__name__ == 'Seat':
                    return self.outer._seats
                if self.model.__name__ == 'Booking':
                    return self.outer._bookings
                if self.model.__name__ == 'BookingSeat':
                    return self.outer._booking_seats
                if self.model.__name__ == 'Bus':
                    return self.outer._buses
                return []
        return Q(self, model)


def test_get_seat_layout_no_travel_date_all_available():
    bus_id = str(uuid.uuid4())
    seats = [DummySeat(uuid.uuid4(), '1A', 'Window', 500), DummySeat(uuid.uuid4(), '1B', 'Aisle', 500)]
    db = DummyDB(seats=seats)
    svc = BusService(db)
    res = svc.get_seat_layout(bus_id, None)
    assert res['bus_id'] == bus_id
    assert len(res['seats']) == 2
    assert all(s['is_available'] for s in res['seats'])


def test_get_seat_layout_with_booking_marks_unavailable():
    bus_uuid = uuid.uuid4()
    s1, s2 = DummySeat(uuid.uuid4(), '1A', 'Window', 500), DummySeat(uuid.uuid4(), '1B', 'Aisle', 500)
    b1 = DummyBooking(uuid.uuid4(), bus_uuid, date(2025, 1, 1), 'CONFIRMED')
    bs1 = DummyBookingSeat(b1.id, s1.id)
    db = DummyDB(seats=[s1, s2], bookings=[b1], booking_seats=[bs1])
    svc = BusService(db)
    res = svc.get_seat_layout(str(bus_uuid), date(2025, 1, 1))
    seat_map = {s['seat_no']: s for s in res['seats']}
    assert seat_map['1A']['is_available'] is False
    assert seat_map['1B']['is_available'] is True


#edge case: invalid bus id returns empty seats
def test_get_seat_layout_invalid_bus_id():
    db = DummyDB()
    svc = BusService(db)
    res = svc.get_seat_layout('not-a-uuid', None)
    assert res['seats'] == []


