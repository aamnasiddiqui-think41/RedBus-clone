import jwt
from datetime import datetime, timedelta
from typing import Optional
import random
import string

# --- Settings ---
SECRET_KEY = "a_super_secret_key"  # TODO: Move to config
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
OTP_LENGTH = 6
OTP_EXPIRE_MINUTES = 5

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def generate_otp(length: int = OTP_LENGTH) -> str:
    """Generate a random numeric OTP."""
    # Generate a random numeric OTP
    return "".join(random.choices(string.digits, k=length))