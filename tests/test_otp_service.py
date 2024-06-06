"""Test module for OTP Service functions"""

from datetime import datetime, timedelta
import pytest
from peewee import SqliteDatabase
from src.utils import create_tables, set_configs


@pytest.fixture()
def set_testing_mode():
    """Set the application mode to testing."""
    set_configs("MODE", "testing")


@pytest.fixture(autouse=True)
def setup_teardown_database(tmp_path, set_testing_mode):
    """Fixture for setting up and tearing down the test database."""
    from src.db_models import OTPRateLimit

    db_path = tmp_path / "test.db"
    test_db = SqliteDatabase(db_path)
    test_db.bind([OTPRateLimit])
    test_db.connect()
    create_tables([OTPRateLimit])

    yield

    test_db.drop_tables([OTPRateLimit])
    test_db.close()


def test_send_otp_success():
    """Test successful OTP sending."""
    from src.otp_service import send_otp

    phone_number = "+237123456789"

    success, message, expires = send_otp(phone_number)

    assert success is True
    assert message == "OTP sent successfully. Check your phone for the code."
    assert isinstance(expires, int)


def test_send_otp_rate_limited():
    """Test when rate limit is exceeded."""
    from src.db_models import OTPRateLimit
    from src.otp_service import send_otp

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
    from src.db_models import OTPRateLimit
    from src.otp_service import send_otp, verify_otp

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
    from src.db_models import OTPRateLimit
    from src.otp_service import send_otp, verify_otp

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
    from src.db_models import OTPRateLimit
    from src.otp_service import send_otp

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
