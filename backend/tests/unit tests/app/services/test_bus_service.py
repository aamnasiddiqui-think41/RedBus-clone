import uuid
from datetime import date

from app.services.bus_service import BusService
from app.schemas.bus import BusSearchRequest


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


class DummyBus:
    def __init__(self, id, operator, from_city_id, to_city_id, departure_time="09:00", arrival_time="18:00", duration="9h", fare=500.0, rating=4.5):
        self.id = id
        self.operator = operator
        self.from_city_id = from_city_id
        self.to_city_id = to_city_id
        self.departure_time = departure_time
        self.arrival_time = arrival_time
        self.duration = duration
        self.fare = fare
        self.rating = rating


class DummyTrip:
    def __init__(self, id, bus_id, service_date, status="ACTIVE"):
        self.id = id
        self.bus_id = bus_id
        self.service_date = service_date
        self.status = status


class DummyDB:
    def __init__(self, seats=None, bookings=None, booking_seats=None, buses=None, trips=None):
        self._seats = seats or []
        self._bookings = bookings or []
        self._booking_seats = booking_seats or []
        self._buses = buses or []
        self._trips = trips or []
        self.raise_on_query = False

    def query(self, model):
        if self.raise_on_query:
            class Broken:
                def filter(self, *a, **k):
                    raise RuntimeError("DB failure")
            return Broken()
        class Q:
            def __init__(self, outer, model):
                self.outer = outer
                self.model = model
                self._filter_args = None
                self._joined_model = None
            def filter(self, *args, **kwargs):
                self._filter_args = args
                return self
            def join(self, joined_model, *args, **kwargs):
                self._joined_model = joined_model
                return self
            def all(self):
                if self.model.__name__ == 'Seat':
                    return self.outer._seats
                if self.model.__name__ == 'Booking':
                    return self.outer._bookings
                if self.model.__name__ == 'BookingSeat':
                    return self.outer._booking_seats
                if self.model.__name__ == 'Bus':
                    # For bus search with trip join, return buses that have matching trips
                    if self._joined_model and self._joined_model.__name__ == 'Trip':
                        # Simple mock: return buses that have trips
                        bus_ids_with_trips = {trip.bus_id for trip in self.outer._trips}
                        return [bus for bus in self.outer._buses if bus.id in bus_ids_with_trips]
                    return self.outer._buses
                if self.model.__name__ == 'Trip':
                    return self.outer._trips
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


#negative path: db error while querying seats returns empty list gracefully
def test_get_seat_layout_db_error_returns_empty(monkeypatch):
    class BrokenDB(DummyDB):
        def query(self, model):
            class Q:
                def filter(self, *args, **kwargs):
                    raise RuntimeError("db broke")
            return Q()
    svc = BusService(BrokenDB())
    res = svc.get_seat_layout(str(uuid.uuid4()), None)
    assert res['seats'] == []


#edge case: database failure returns empty structure (graceful handling)
def test_get_seat_layout_db_failure_returns_empty():
    db = DummyDB()
    db.raise_on_query = True
    svc = BusService(db)
    res = svc.get_seat_layout(str(uuid.uuid4()), None)
    assert res['seats'] == []


def test_search_buses_without_date_returns_all_route_buses():
    from_city_id = uuid.uuid4()
    to_city_id = uuid.uuid4()
    bus1 = DummyBus(uuid.uuid4(), "ACME Travels", from_city_id, to_city_id)
    bus2 = DummyBus(uuid.uuid4(), "Best Bus", from_city_id, to_city_id)
    db = DummyDB(buses=[bus1, bus2])
    svc = BusService(db)
    
    search_req = BusSearchRequest(from_city_id=from_city_id, to_city_id=to_city_id)
    result = svc.search_buses(search_req)
    
    assert len(result) == 2
    operators = [bus['operator'] for bus in result]
    assert 'ACME Travels' in operators
    assert 'Best Bus' in operators


def test_search_buses_with_date_filters_by_trips():
    from_city_id = uuid.uuid4()
    to_city_id = uuid.uuid4()
    bus1 = DummyBus(uuid.uuid4(), "ACME Travels", from_city_id, to_city_id)
    bus2 = DummyBus(uuid.uuid4(), "Best Bus", from_city_id, to_city_id)
    
    # Only bus1 has a trip on the search date
    trip1 = DummyTrip(uuid.uuid4(), bus1.id, date(2025, 1, 15))
    
    db = DummyDB(buses=[bus1, bus2], trips=[trip1])
    svc = BusService(db)
    
    search_req = BusSearchRequest(from_city_id=from_city_id, to_city_id=to_city_id, travel_date=date(2025, 1, 15))
    result = svc.search_buses(search_req)
    
    # Only bus1 should be returned since it has a trip on that date
    assert len(result) == 1
    assert result[0]['operator'] == 'ACME Travels'


def test_search_buses_with_date_no_trips_returns_empty():
    from_city_id = uuid.uuid4()
    to_city_id = uuid.uuid4()
    bus1 = DummyBus(uuid.uuid4(), "ACME Travels", from_city_id, to_city_id)
    
    # No trips for the search date
    db = DummyDB(buses=[bus1], trips=[])
    svc = BusService(db)
    
    search_req = BusSearchRequest(from_city_id=from_city_id, to_city_id=to_city_id, travel_date=date(2025, 1, 15))
    result = svc.search_buses(search_req)
    
    # No buses should be returned since no trips on that date
    assert len(result) == 0


#edge case: search buses db error returns empty list gracefully
def test_search_buses_db_error_returns_empty():
    from_city_id = uuid.uuid4()
    to_city_id = uuid.uuid4()
    db = DummyDB()
    db.raise_on_query = True
    svc = BusService(db)
    
    search_req = BusSearchRequest(from_city_id=from_city_id, to_city_id=to_city_id)
    result = svc.search_buses(search_req)
    
    assert result == []


