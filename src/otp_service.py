"""OTP Service Module."""

import datetime
import logging
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from src.db_models import OTPRateLimit
from src.utils import get_configs

logging.basicConfig(
    level=logging.INFO, format=("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
)
logger = logging.getLogger("[OTP Service]")

TWILIO_ACCOUNT_SID = get_configs("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = get_configs("TWILIO_AUTH_TOKEN")
TWILIO_SERVICE_SID = get_configs("TWILIO_SERVICE_SID")
MOCK_OTP = get_configs("MOCK_OTP")
MOCK_OTP = MOCK_OTP.lower() == "true" if MOCK_OTP is not None else False

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
        return False, "Too many OTP requests. Please wait and try again later.", None

    expires = None

    if MOCK_OTP:
        success, message = mock_send_otp(phone_number)
    else:
        success, message = twilio_send_otp(phone_number)

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
    if not OTPRateLimit.get_or_none(OTPRateLimit.phone_number == phone_number):
        return (
            False,
            "OTP not initiated. Please request a new OTP before attempting to verify.",
        )

    if MOCK_OTP:
        success, message = mock_verify_otp(phone_number, otp)
    else:
        success, message = twilio_verify_otp(phone_number, otp)

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
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    try:
        verification = client.verify.v2.services(
            TWILIO_SERVICE_SID
        ).verifications.create(to=phone_number, channel="sms")
        if verification.status == "pending":
            logger.info("OTP sent to %s.", phone_number)
            return True, "OTP sent successfully. Please check your phone for the code."

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
        return (False, "Failed to send OTP. Please try again later.")


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
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    try:
        verification_check = client.verify.v2.services(
            TWILIO_SERVICE_SID
        ).verification_checks.create(to=phone_number, code=otp)

        status = verification_check.status

        if status == "approved":
            logger.info("OTP verified successfully for %s.", phone_number)
            return True, "OTP verified successfully."

        if status == "pending":
            logger.error("Incorrect OTP provided for %s.", phone_number)
            return False, "Incorrect OTP. Please double-check the code and try again."

        logger.warning(
            "Unexpected OTP verification status for %s: %s", phone_number, status
        )
        return (False, "Failed to verify OTP. Please try again later.")
    except TwilioRestException as e:
        logger.error("Twilio error while verifying OTP for %s: %s", phone_number, e)

        if e.status == 404:
            return False, "OTP verification expired. Please request a new code."

        logger.warning(
            "Unexpected OTP verification status for %s: %s", phone_number, e.status
        )
        return (False, "Failed to verify OTP. Please try again later.")


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
    return True, "OTP sent successfully. Please check your phone for the code."


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
        return True, "OTP verified successfully."

    logger.warning("Incorrect OTP %s provided for %s.", otp, phone_number)
    return False, "Incorrect OTP. Please double-check the code and try again."


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

    logger.info("Cleaned up expired rate limit records for %s.", phone_number)


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

    logger.info(
        "Incremented rate limit for %s. Current attempt count: %d.",
        phone_number,
        rate_limit.attempt_count,
    )

    return rate_limit


def clear_rate_limit(phone_number):
    """
    Clear the rate limit counter for the provided phone number.

    Args:
        phone_number (str): The phone number to clear the rate limit counter for.
    """
    OTPRateLimit.delete().where(OTPRateLimit.phone_number == phone_number).execute()

    logger.info("Cleared rate limit for %s.", phone_number)