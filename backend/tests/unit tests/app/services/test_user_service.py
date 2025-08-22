import uuid
from datetime import date

from app.services.user_service import UserService


class DummyUser:
    def __init__(self, id):
        self.id = id
        self.name = None
        self.email = None
        self.gender = None
        self.dob = None


class DummyDB:
    def __init__(self, user=None):
        self._user = user
        self.committed = False
        self.fail_commit = False

    def query(self, model):
        class Q:
            def __init__(self, u):
                self.u = u
            def filter(self, *args, **kwargs):
                class _Q:
                    def __init__(self, u):
                        self.u = u
                    def first(self):
                        return self.u
                return _Q(self.u)
        return Q(self._user)

    def add(self, obj):
        pass

    def commit(self):
        if self.fail_commit:
            raise RuntimeError("commit failed")
        self.committed = True

    def refresh(self, obj):
        pass


def test_update_user_updates_fields():
    user_id = uuid.uuid4()
    dummy_user = DummyUser(user_id)
    db = DummyDB(dummy_user)
    svc = UserService(db)

    from app.schemas.user import UserUpdate
    updated = svc.update_user(user_id, UserUpdate(name="Jane", email="jane@example.com", gender="Female", dob=date(1995, 5, 5)))

    assert updated.name == "Jane"
    assert updated.email == "jane@example.com"
    assert updated.gender == "Female"
    assert updated.dob == date(1995, 5, 5)
    assert db.committed is True


#edge case: user not found returns None
def test_update_user_none_if_missing():
    user_id = uuid.uuid4()
    db = DummyDB(None)
    svc = UserService(db)
    from app.schemas.user import UserUpdate
    assert svc.update_user(user_id, UserUpdate(name="Nope")) is None


#edge case: commit failure should propagate
def test_update_user_commit_failure_raises():
    user_id = uuid.uuid4()
    dummy_user = DummyUser(user_id)
    db = DummyDB(dummy_user)
    db.fail_commit = True
    svc = UserService(db)
    from app.schemas.user import UserUpdate
    try:
        svc.update_user(user_id, UserUpdate(name="X"))
        assert False, 'Expected RuntimeError'
    except RuntimeError as e:
        assert 'commit failed' in str(e)


