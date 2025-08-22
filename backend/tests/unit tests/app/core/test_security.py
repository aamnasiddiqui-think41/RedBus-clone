import re
from datetime import timedelta

from app.core.security import create_access_token, verify_token, generate_otp


def test_create_and_verify_access_token():
    token = create_access_token({"sub": "user-123"}, expires_delta=timedelta(minutes=1))
    payload = verify_token(token)
    assert payload is not None and payload.get("sub") == "user-123"


def test_verify_token_invalid_returns_none():
    assert verify_token("invalid.token.parts") is None


#edge case: otp length and numeric only
def test_generate_otp_defaults_numeric_six_digits(monkeypatch):
    otp = generate_otp()
    assert re.fullmatch(r"\d{6}", otp)


