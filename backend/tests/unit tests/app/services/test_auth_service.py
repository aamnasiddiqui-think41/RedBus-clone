import uuid
import pytest
from datetime import datetime, timedelta, timezone

from app.services.auth_service import AuthService
from app.schemas.auth import OTPRequest
from app.db.models.otp import OTP
from app.db.models.user import User


class DummySession:
    def __init__(self):
        self.objects = []
        self._committed = False
        self._rolled_back = False
        self._fail_commit = False

    def add(self, obj):
        self.objects.append(obj)

    def commit(self):
        if self._fail_commit:
            raise RuntimeError("commit failed")
        self._committed = True

    def refresh(self, obj):
        # Simulate DB assigning an ID
        if getattr(obj, 'id', None) is None:
            obj.id = uuid.uuid4()

    def rollback(self):
        self._rolled_back = True

    def query(self, model):
        class Query:
            def __init__(self, store):
                self.store = store
                self.model = model

            def filter(self, *args, **kwargs):
                # Very small fake filter for OTP by id and User by phone
                results = []
                for obj in self.store:
                    if not isinstance(obj, self.model):
                        continue
                    results.append(obj)

                class _Q:
                    def __init__(self, res):
                        self.res = res

                    def first(self):
                        return self.res[0] if self.res else None

                    def all(self):
                        return self.res

                return _Q(results)

        return Query(self.objects)


#negative path: request_otp commit failure should rollback and raise
def test_request_otp_commit_failure_rolls_back_and_raises(monkeypatch):
    class FailingSession(DummySession):
        def __init__(self):
            super().__init__()
            self.rolled_back = False
        def commit(self):
            raise RuntimeError("db commit failed")
        def rollback(self):
            self.rolled_back = True

    db = FailingSession()
    svc = AuthService(db)
    from app.schemas.auth import OTPRequest
    with pytest.raises(RuntimeError):
        svc.request_otp(OTPRequest(country_code="+91", phone="9876543210"))
    assert db.rolled_back is True

def test_request_otp_commit_failure_rolls_back_and_raises():
    db = DummySession()
    db._fail_commit = True
    svc = AuthService(db)
    from app.schemas.auth import OTPRequest
    with pytest.raises(RuntimeError):
        svc.request_otp(OTPRequest(country_code="+91", phone="9876543210"))
    assert db._rolled_back is True



def test_request_otp_validates_phone_and_creates_record():
    db = DummySession()
    svc = AuthService(db)
    req = OTPRequest(country_code="+91", phone="9876543210")
    result = svc.request_otp(req)
    assert 'otp_id' in result
    assert any(isinstance(o, OTP) for o in db.objects)


def test_request_otp_invalid_phone():
    db = DummySession()
    svc = AuthService(db)
    with pytest.raises(ValueError):
        svc.request_otp(OTPRequest(country_code="+91", phone="12345"))


def test_verify_otp_flow_success_creates_user_and_token(monkeypatch):
    db = DummySession()
    svc = AuthService(db)

    otp = OTP(phone="+919876543210", otp_code="123456", expires_at=datetime.now(timezone.utc) + timedelta(minutes=5))
    otp.id = uuid.uuid4()
    db.add(otp)

    # Monkeypatch token creation to a static value (patch where it's used)
    import app.services.auth_service as auth_service_module
    monkeypatch.setattr(auth_service_module, 'create_access_token', lambda data: 'testtoken')

    result = svc.verify_otp(str(otp.id), "123456")
    assert result is not None
    assert result['token'] == 'testtoken'
    assert any(isinstance(o, User) for o in db.objects)


#edge case: expired otp should fail
def test_verify_otp_expired_returns_none():
    db = DummySession()
    svc = AuthService(db)
    otp = OTP(phone="+919876543210", otp_code="123456", expires_at=datetime.now(timezone.utc) - timedelta(minutes=1))
    otp.id = uuid.uuid4()
    db.add(otp)
    assert svc.verify_otp(str(otp.id), "123456") is None


#edge case: non-digit otp rejected
def test_verify_otp_non_digit_rejected():
    db = DummySession()
    svc = AuthService(db)
    otp = OTP(phone="+919876543210", otp_code="123456", expires_at=datetime.now(timezone.utc) + timedelta(minutes=5))
    otp.id = uuid.uuid4()
    db.add(otp)
    assert svc.verify_otp(str(otp.id), "12a456") is None


def test_verify_otp_wrong_code_returns_none():
    db = DummySession()
    svc = AuthService(db)
    otp = OTP(phone="+919876543210", otp_code="123456", expires_at=datetime.now(timezone.utc) + timedelta(minutes=5))
    otp.id = uuid.uuid4()
    db.add(otp)
    assert svc.verify_otp(str(otp.id), "654321") is None


