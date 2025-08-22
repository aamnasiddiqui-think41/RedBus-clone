import uuid
import builtins
from datetime import date

from app.services.booking_service import BookingService
from app.db.models.bus import Bus
from app.db.models.city import City
from app.db.models.seat import Seat
from app.db.models.booking import Booking
from app.db.models.booking_seat import BookingSeat


class DummyBus:
    def __init__(self, id, operator, from_city_id, to_city_id):
        self.id = id
        self.operator = operator
        self.from_city_id = from_city_id
        self.to_city_id = to_city_id


class DummyCity:
    def __init__(self, id, name):
        self.id = id
        self.name = name


class DummySeat:
    def __init__(self, id, bus_id, seat_no, seat_type, price, is_available=True):
        self.id = id
        self.bus_id = bus_id
        self.seat_no = seat_no
        self.seat_type = seat_type
        self.price = price
        self.is_available = is_available


class DummyUser:
    def __init__(self, id):
        self.id = id


class DummyDB:
    def __init__(self, buses=None, cities=None, seats=None, bookings=None, booking_seats=None):
        self._buses = buses or []
        self._cities = cities or []
        self._seats = seats or []
        self._bookings = bookings or []
        self._booking_seats = booking_seats or []
        self.committed = False
        self.flushed = False

    def add(self, obj):
        # Append to appropriate store by type name
        tn = type(obj).__name__
        if tn == 'Booking':
            self._bookings.append(obj)
        elif tn == 'BookingSeat':
            self._booking_seats.append(obj)
        elif isinstance(obj, DummySeat):
            self._seats.append(obj)
        elif isinstance(obj, DummyBus):
            self._buses.append(obj)
        elif isinstance(obj, DummyCity):
            self._cities.append(obj)

    def flush(self):
        self.flushed = True

    def commit(self):
        self.committed = True

    def rollback(self):
        self.committed = False

    def query(self, model):
        # Determine dataset by model
        if model.__name__ == 'Bus':
            dataset = self._buses
        elif model.__name__ == 'City':
            dataset = self._cities
        elif model.__name__ == 'Seat':
            dataset = self._seats
        elif model.__name__ == 'Booking':
            dataset = self._bookings
        elif model.__name__ == 'BookingSeat':
            dataset = self._booking_seats
        else:
            dataset = []

        class Q:
            def __init__(self, data):
                self.data = list(data)
                self._criteria = []

            def filter(self, *args):
                # Try to extract value from binary expressions like Model.field == value
                for expr in args:
                    try:
                        colname = getattr(expr.left, 'key', None) or getattr(expr.left, 'name', None)
                        value = getattr(expr.right, 'value', None)
                        if colname is not None:
                            self._criteria.append((colname, value))
                    except Exception:
                        # Ignore if not a SQLAlchemy binary expression
                        pass
                # Apply criteria
                if self._criteria:
                    for col, val in self._criteria:
                        self.data = [o for o in self.data if getattr(o, col, None) == val]
                return self

            def first(self):
                return self.data[0] if self.data else None

            def all(self):
                return list(self.data)

        return Q(dataset)


def test_create_booking_success_marks_seats_and_returns():
    bus_uuid = uuid.uuid4()
    from_city_id = uuid.uuid4()
    to_city_id = uuid.uuid4()
    db = DummyDB(
        buses=[DummyBus(bus_uuid, 'ACME Travels', from_city_id, to_city_id)],
        cities=[DummyCity(from_city_id, 'FromCity'), DummyCity(to_city_id, 'ToCity')],
        seats=[
            DummySeat(uuid.uuid4(), bus_uuid, 'A1', 'Window', 500.0),
            DummySeat(uuid.uuid4(), bus_uuid, 'A2', 'Aisle', 600.0),
        ]
    )
    svc = BookingService(db)
    from app.schemas.booking import BookingCreate, PassengerDetail, ContactInfo
    booking_data = BookingCreate(
        bus_id=str(bus_uuid),
        travel_date=date(2025, 1, 1),
        seats=['A1', 'A2'],
        passenger_details=[PassengerDetail(name='X', age=30, gender='Male')],
        contact=ContactInfo(phone='+911234567890', email='x@example.com')
    )
    user = DummyUser(uuid.uuid4())

    res = svc.create_booking(booking_data, user)
    assert res['status'] == 'CONFIRMED'
    assert res['amount'] == 1100.0
    # Seats should be marked unavailable
    assert all(not s.is_available for s in db._seats)
    # BookingSeat records created
    assert len([o for o in db._booking_seats if isinstance(o, BookingSeat)]) == 2


def test_create_booking_invalid_bus_id_raises():
    db = DummyDB()
    svc = BookingService(db)
    from app.schemas.booking import BookingCreate, PassengerDetail, ContactInfo
    booking_data = BookingCreate(
        bus_id='not-a-uuid',
        travel_date=date(2025, 1, 1),
        seats=['A1'],
        passenger_details=[PassengerDetail(name='X', age=30, gender='Male')],
        contact=ContactInfo(phone='+911234567890', email='x@example.com')
    )
    user = DummyUser(uuid.uuid4())
    try:
        svc.create_booking(booking_data, user)
        assert False, 'Expected ValueError'
    except ValueError as e:
        assert 'Invalid bus ID' in str(e)


def test_create_booking_bus_not_found():
    bus_uuid = uuid.uuid4()
    db = DummyDB(buses=[], seats=[])
    svc = BookingService(db)
    from app.schemas.booking import BookingCreate, PassengerDetail, ContactInfo
    booking_data = BookingCreate(
        bus_id=str(bus_uuid),
        travel_date=date(2025, 1, 1),
        seats=['A1'],
        passenger_details=[PassengerDetail(name='X', age=30, gender='Male')],
        contact=ContactInfo(phone='+911234567890', email='x@example.com')
    )
    user = DummyUser(uuid.uuid4())
    try:
        svc.create_booking(booking_data, user)
        assert False, 'Expected ValueError'
    except ValueError as e:
        assert 'Bus not found' in str(e)


#edge case: seat number not present should raise
def test_create_booking_seat_not_found():
    bus_uuid = uuid.uuid4()
    from_city_id = uuid.uuid4()
    to_city_id = uuid.uuid4()
    db = DummyDB(
        buses=[DummyBus(bus_uuid, 'ACME Travels', from_city_id, to_city_id)],
        cities=[DummyCity(from_city_id, 'FromCity'), DummyCity(to_city_id, 'ToCity')],
        seats=[DummySeat(uuid.uuid4(), bus_uuid, 'A1', 'Window', 500.0)]
    )
    svc = BookingService(db)
    from app.schemas.booking import BookingCreate, PassengerDetail, ContactInfo
    booking_data = BookingCreate(
        bus_id=str(bus_uuid),
        travel_date=date(2025, 1, 1),
        seats=['A3'],
        passenger_details=[PassengerDetail(name='X', age=30, gender='Male')],
        contact=ContactInfo(phone='+911234567890', email='x@example.com')
    )
    user = DummyUser(uuid.uuid4())
    try:
        svc.create_booking(booking_data, user)
        assert False, 'Expected ValueError'
    except ValueError as e:
        assert 'Seat A3 not found' in str(e)


def test_get_user_bookings_returns_expected_structure():
    user_id = uuid.uuid4()
    bus_id = uuid.uuid4()
    from_city_id = uuid.uuid4()
    to_city_id = uuid.uuid4()
    # Prepare seats
    seat1_id, seat2_id = uuid.uuid4(), uuid.uuid4()
    seats = [DummySeat(seat1_id, bus_id, 'A1', 'Window', 500.0), DummySeat(seat2_id, bus_id, 'A2', 'Aisle', 600.0)]
    # Prepare booking and booking seats
    booking = Booking(id=uuid.uuid4(), user_id=user_id, bus_id=bus_id, date=date(2025, 1, 1), status='CONFIRMED', amount=1100.0)
    bseat1 = BookingSeat(id=uuid.uuid4(), booking_id=booking.id, seat_id=seat1_id)
    bseat2 = BookingSeat(id=uuid.uuid4(), booking_id=booking.id, seat_id=seat2_id)
    db = DummyDB(
        buses=[DummyBus(bus_id, 'ACME Travels', from_city_id, to_city_id)],
        cities=[DummyCity(from_city_id, 'FromCity'), DummyCity(to_city_id, 'ToCity')],
        seats=seats,
        bookings=[booking],
        booking_seats=[bseat1, bseat2]
    )
    svc = BookingService(db)
    user = DummyUser(user_id)
    out = svc.get_user_bookings(user)
    assert len(out) == 1
    entry = out[0]
    assert entry['booking_id'] == str(booking.id)
    assert entry['bus_name'] == 'ACME Travels'
    assert entry['from_city'] == 'FromCity'
    assert entry['to_city'] == 'ToCity'
    assert entry['seats'] == ['A1', 'A2']
    assert entry['status'] == 'CONFIRMED'
    assert entry['amount'] == 1100.0


