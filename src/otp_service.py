"""OTP Service Module."""

import datetime
import logging
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from src.models import OTPRateLimit
from settings import Configurations

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TWILIO_ACCOUNT_SID = "your_account_sid"
TWILIO_AUTH_TOKEN = "your_auth_token"
TWILIO_SERVICE_SID = "your_twilio_service_sid"
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

RATE_LIMIT_WINDOWS = [
    {"duration": 2, "count": 1},  # 2 minute window
    {"duration": 5, "count": 2},  # 5 minute window
    {"duration": 15, "count": 3},  # 15 minute window
    {"duration": 1440, "count": 4},  # 24 hour window
]


def is_rate_limited(phone_number):
    """
    Check if the provided phone number has exceeded the rate limit
    for OTP (One-Time Password) requests.

    Args:
        phone_number (str): The phone number to check.

    Returns:
        bool: True if the phone number is rate limited, False otherwise.
    """
    current_time = datetime.datetime.now()
    rate_limit = OTPRateLimit.get_or_none(OTPRateLimit.phone_number == phone_number)

    if rate_limit:
        clean_rate_limit_store(phone_number)
        index = next(
            (
                i
                for i, window in enumerate(RATE_LIMIT_WINDOWS)
                if window["count"] == rate_limit.attempt_count
            ),
            -1,
        )

        if rate_limit.date_expires >= current_time:
            logger.info(
                "Rate limit exceeded for phone number %s in %s-minute window.",
                phone_number,
                RATE_LIMIT_WINDOWS[index]["duration"],
            )
            return True
    return False


def send_otp(phone_number):
    """
    Send an OTP to the provided phone number.

    Args:
        phone_number (str): The phone number to send the OTP to.

    Returns:
        tuple: A tuple containing the following elements:
            - A boolean indicating whether the OTP was sent successfully.
            - A message indicating the result of the OTP sending process.
            - The OTP expiry time as an integer timestamp, if applicable; otherwise, None.
    """
    if is_rate_limited(phone_number):
        return False, "Too many OTP requests. Please try again later.", None

    expires = None

    if Configurations.MODE == "production":
        success, message = twilio_send_otp(phone_number)
    else:
        success, message = mock_send_otp(phone_number)

    if success:
        otp = increment_rate_limit(phone_number)
        expires = int(otp.date_expires.timestamp())

    return success, message, expires


def verify_otp(phone_number, otp):
    """
    Verify the provided OTP for the given phone number.

    Args:
        phone_number (str): The phone number to verify the OTP for.
        otp (str): The OTP to verify.

    Returns:
        tuple: A tuple containing the following elements:
            - A boolean indicating whether the OTP was verified successfully.
            - A message indicating the result of the OTP verification process.
    """
    if Configurations.MODE == "production":
        success, message = twilio_verify_otp(phone_number, otp)
    else:
        success, message = mock_verify_otp(phone_number, otp)

    if success:
        clear_rate_limit(phone_number)

    return success, message


def twilio_send_otp(phone_number):
    """
    Send an OTP using Twilio to the provided phone number.

    Args:
        phone_number (str): The phone number to send the OTP to.

    Returns:
        tuple: A tuple containing the following elements:
            - A boolean indicating whether the OTP was sent successfully.
            - A message indicating the result of the OTP sending process.
    """
    try:
        verification = client.verify.v2.services(
            TWILIO_SERVICE_SID
        ).verifications.create(to=phone_number, channel="sms")
        if verification.status == "pending":
            logger.info("OTP sent to %s.", phone_number)
            return True, "OTP sent successfully. Check your phone for the code."

        logger.error(
            "Failed to send OTP to %s. Twilio status: %s",
            phone_number,
            verification.status,
        )
        return (
            False,
            "Failed to send OTP. Please ensure your phone number is correct and try again later.",
        )
    except TwilioRestException as e:
        logger.error("Twilio error while sending OTP to %s: %s", phone_number, e)
        return False, "Failed to send OTP. Please try again later."


def twilio_verify_otp(phone_number, otp):
    """
    Verify the provided OTP using Twilio for the given phone number.

    Args:
        phone_number (str): The phone number to verify the OTP for.
        otp (str): The OTP to verify.

    Returns:
        tuple: A tuple containing the following elements:
            - A boolean indicating whether the OTP was verified successfully.
            - A message indicating the result of the OTP verification process.
    """
    try:
        verification_check = client.verify.v2.services(
            TWILIO_SERVICE_SID
        ).verification_checks.create(to=phone_number, code=otp)
        if verification_check.status == "approved":
            logger.info("OTP verified successfully for %s.", phone_number)
            return True, "OTP verified successfully."

        logger.warning("Invalid OTP provided for %s.", phone_number)
        return False, "Invalid OTP. Please double-check the code and try again."
    except TwilioRestException as e:
        logger.error("Twilio error while verifying OTP for %s: %s", phone_number, e)
        return False, "Failed to verify OTP. Please try again later."


def mock_send_otp(phone_number):
    """
    Mock function to send OTP to a phone number.

    Args:
        phone_number (str): The phone number to which OTP will be sent.

    Returns:
        tuple: A tuple containing two elements:
            - A boolean indicating whether the OTP was sent successfully.
            - A string message indicating the result of the OTP sending process.
    """
    logger.info("Mock OTP sent to %s.", phone_number)
    return True, "Mock OTP sent successfully. OTP code is 123456."


def mock_verify_otp(phone_number, otp):
    """
    Mock function to verify OTP for a phone number.

    Args:
        phone_number (str): The phone number for which OTP is being verified.
        otp (str): The OTP code to verify.

    Returns:
        tuple: A tuple containing two elements:
            - A boolean indicating whether the OTP was verified successfully.
            - A string message indicating the result of the OTP verification process.
    """
    if otp == "123456":
        logger.info("Mock OTP verified successfully for %s. OTP %s.", phone_number, otp)
        return True, "Mock OTP verified successfully."

    logger.warning("Invalid OTP %s provided for %s.", otp, phone_number)
    return False, "Invalid OTP. Please double-check the code and try again."


def clean_rate_limit_store(phone_number):
    """
    Clean up expired rate limit records for the provided phone number.

    Args:
        phone_number (str): The phone number to clean up rate limit records for.
    """
    current_time = datetime.datetime.now()

    OTPRateLimit.delete().where(
        OTPRateLimit.phone_number == phone_number,
        OTPRateLimit.date_expires < current_time,
        OTPRateLimit.attempt_count >= RATE_LIMIT_WINDOWS[-1]["count"],
    ).execute()

    logger.info("Cleaned up rate limit records for %s.", phone_number)


def increment_rate_limit(phone_number):
    """
    Increment the rate limit counter for the provided phone number.

    Args:
        phone_number (str): The phone number to increment the rate limit counter for.

    Returns:
        OTPRateLimit: The updated or created OTP rate limit record.
    """
    current_time = datetime.datetime.now()

    rate_limit, created = OTPRateLimit.get_or_create(
        phone_number=phone_number,
        defaults={
            "date_expires": current_time
            + datetime.timedelta(minutes=RATE_LIMIT_WINDOWS[0]["duration"]),
            "attempt_count": RATE_LIMIT_WINDOWS[0]["count"],
        },
    )

    if not created:
        rate_limit.attempt_count += 1
        index = next(
            (
                i
                for i, window in enumerate(RATE_LIMIT_WINDOWS)
                if window["count"] == rate_limit.attempt_count
            ),
            -1,
        )

        rate_limit.date_expires = current_time + datetime.timedelta(
            minutes=RATE_LIMIT_WINDOWS[index]["duration"]
        )
        rate_limit.save()

    logger.info("Incremented rate limit for %s.", phone_number)
    return rate_limit


def clear_rate_limit(phone_number):
    """
    Clear the rate limit record for the provided phone number.

    Args:
        phone_number (str): The phone number to clear the rate limit record for.
    """
    OTPRateLimit.delete().where(OTPRateLimit.phone_number == phone_number).execute()

    logger.info("Cleared rate limit for %s.", phone_number)
