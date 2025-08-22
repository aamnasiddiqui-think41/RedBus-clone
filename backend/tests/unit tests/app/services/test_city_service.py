from app.services.city_service import CityService


class DummyCity:
    def __init__(self, id, name):
        self.id = id
        self.name = name


class DummyDB:
    def __init__(self, cities=None):
        self._cities = cities or []

    def query(self, model):
        class Q:
            def __init__(self, outer):
                self.outer = outer
            def all(self):
                return self.outer._cities
        return Q(self)


def test_get_all_cities_success():
    db = DummyDB([DummyCity("1", "CityA"), DummyCity("2", "CityB")])
    svc = CityService(db)
    out = svc.get_all_cities()
    assert [c["name"] for c in out] == ["CityA", "CityB"]


#edge case: db error returns empty list (graceful fallback)
def test_get_all_cities_db_error_returns_empty(monkeypatch):
    class BrokenDB(DummyDB):
        def query(self, model):
            class Q:
                def all(self):
                    raise RuntimeError("db broken")
            return Q()
    svc = CityService(BrokenDB())
    assert svc.get_all_cities() == []


#edge case: empty table returns empty list
def test_get_all_cities_empty():
    db = DummyDB([])
    svc = CityService(db)
    assert svc.get_all_cities() == []


