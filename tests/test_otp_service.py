"""Test module for OTP Service functions"""

from datetime import datetime, timedelta
import pytest
from src.otp_service import send_otp, verify_otp
from src.models import OTPRateLimit


@pytest.fixture(autouse=True)
def clean_up_otp(request):
    """Fixture to clean up OTPRateLimit records after test execution."""

    def fin():
        OTPRateLimit.delete().execute()

    request.addfinalizer(fin)


def test_send_otp_success():
    """Test successful OTP sending."""
    phone_number = "+237123456789"

    success, message, expires = send_otp(phone_number)

    assert success is True
    assert message == "OTP sent successfully. Check your phone for the code."
    assert isinstance(expires, datetime)


def test_send_otp_rate_limited():
    """Test when rate limit is exceeded."""
    phone_number = "+237123456789"

    OTPRateLimit.create(
        phone_number=phone_number,
        attempt_count=1,
        date_expires=datetime.now() + timedelta(minutes=15),
    )

    success, message, expires = send_otp(phone_number)

    assert success is False
    assert message == "Too many OTP requests. Please try again later."
    assert expires is None


def test_verify_otp_success():
    """Test successful OTP verification."""
    phone_number = "+237123456789"

    success, _, _ = send_otp(phone_number)
    assert success is True

    otp = "123456"
    success, message = verify_otp(phone_number, otp)

    assert success is True
    assert message == "OTP verified successfully."
    assert (
        OTPRateLimit.select().where(OTPRateLimit.phone_number == phone_number).count()
        == 0
    )


def test_verify_otp_failure():
    """Test OTP verification failure."""
    phone_number = "+237123456789"

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
    phone_number = "+237123456789"

    OTPRateLimit.create(
        phone_number=phone_number,
        attempt_count=4,
        date_expires=datetime.now() - timedelta(minutes=1),
    )

    success, _, _ = send_otp(phone_number)

    assert success is True

    otp_rate_limit = OTPRateLimit.get(OTPRateLimit.phone_number == phone_number)
    assert otp_rate_limit.attempt_count == 1
