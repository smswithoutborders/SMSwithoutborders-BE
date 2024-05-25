"""Test module for OTP Service functions"""

import os

os.environ["MODE"] = "testing"

from datetime import datetime, timedelta
import pytest
from peewee import SqliteDatabase
from src.otp_service import send_otp, verify_otp
from src.models import OTPRateLimit
from src.utils import create_tables


@pytest.fixture(scope="module", autouse=True)
def setup_teardown():
    """Fixture for setting up and tearing down the test database."""
    test_db = SqliteDatabase(":memory:")
    test_db.bind([OTPRateLimit])
    test_db.connect()
    create_tables([OTPRateLimit])
    yield
    test_db.drop_tables([OTPRateLimit])
    test_db.close()


@pytest.fixture(autouse=True)
def clean_up_otp(request):
    """Fixture to clean up OTPRateLimit records after test execution."""

    def fin():
        OTPRateLimit.delete().execute()

    request.addfinalizer(fin)


def test_send_otp_success():
    """Test successful OTP sending."""
    phone_number = "1234567890"

    success, message, expires = send_otp(phone_number)

    assert success is True
    assert "OTP sent" in message
    assert isinstance(expires, datetime)


def test_send_otp_rate_limited():
    """Test when rate limit is exceeded."""
    phone_number = "1234567890"

    OTPRateLimit.create(
        phone_number=phone_number,
        attempt_count=1,
        date_expires=datetime.now() + timedelta(minutes=15),
    )

    success, message, expires = send_otp(phone_number)

    assert success is False
    assert "Too many OTP requests" in message
    assert expires is None


def test_verify_otp_success():
    """Test successful OTP verification."""
    phone_number = "1234567890"

    success, _, _ = send_otp(phone_number)
    assert success is True

    otp = "123456"
    success, message = verify_otp(phone_number, otp)

    assert success is True
    assert "verified successfully" in message
    assert (
        OTPRateLimit.select().where(OTPRateLimit.phone_number == phone_number).count()
        == 0
    )


def test_verify_otp_failure():
    """Test OTP verification failure."""
    phone_number = "1234567890"

    success, _, _ = send_otp(phone_number)
    assert success is True

    otp = "654321"
    success, message = verify_otp(phone_number, otp)

    assert success is False
    assert "Invalid OTP" in message
    assert (
        OTPRateLimit.select().where(OTPRateLimit.phone_number == phone_number).count()
        == 1
    )


def test_rate_limit_reset():
    """Test if rate limit is reset after the last window expires."""
    phone_number = "1234567890"

    OTPRateLimit.create(
        phone_number=phone_number,
        attempt_count=4,
        date_expires=datetime.now() - timedelta(minutes=1),
    )

    success, _, _ = send_otp(phone_number)

    assert success is True

    otp_rate_limit = OTPRateLimit.get(OTPRateLimit.phone_number == phone_number)
    assert otp_rate_limit.attempt_count == 1
