"""Password Rate Limit Module."""

import datetime
import logging
from src.db_models import PasswordRateLimit

logging.basicConfig(
    level=logging.INFO, format=("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
)
logger = logging.getLogger("[Password Rate Limit]")

RATE_LIMIT_WINDOWS = [
    {"duration": 3, "count": 3},  # 3 attempts in 2 minutes
    {"duration": 5, "count": 5},  # 5 attempts in 15 minutes
    {"duration": 15, "count": 7},  # 7 attempts in 60 minutes
    {"duration": 1440, "count": 9},  # 9 attempts in 24 hours
]

ATTEMPT_COUNTS = [window["count"] for window in RATE_LIMIT_WINDOWS]


def is_rate_limited(eid):
    """
    Check if the provided entity has exceeded the rate limit for password attempts.

    Args:
        eid (str): The entity to check.

    Returns:
        bool: True if the entity is rate limited, False otherwise.
    """
    current_time = datetime.datetime.now()
    rate_limit = PasswordRateLimit.get_or_none(PasswordRateLimit.eid == eid)

    if rate_limit:
        clean_rate_limit_store(eid)

        if rate_limit.attempt_count in ATTEMPT_COUNTS:
            if rate_limit.date_expires >= current_time:
                index = ATTEMPT_COUNTS.index(rate_limit.attempt_count)
                logger.info(
                    "Rate limit exceeded for entity %s in %s-minute window.",
                    eid,
                    RATE_LIMIT_WINDOWS[index]["duration"],
                )
                return True

    return False


def register_password_attempt(eid):
    """
    Register a password attempt for the provided entity.

    Args:
        eid (str): The entity to register the attempt for.
    """
    current_time = datetime.datetime.now()

    rate_limit, created = PasswordRateLimit.get_or_create(
        eid=eid,
        defaults={"attempt_count": 1},
    )

    if not created:
        rate_limit.attempt_count += 1

        if rate_limit.attempt_count in ATTEMPT_COUNTS:
            index = ATTEMPT_COUNTS.index(rate_limit.attempt_count)
            rate_limit.date_expires = current_time + datetime.timedelta(
                minutes=RATE_LIMIT_WINDOWS[index]["duration"]
            )

        rate_limit.save()

    logger.info(
        "Registered password attempt for %s. Current attempt count: %d.",
        eid,
        rate_limit.attempt_count,
    )


def clean_rate_limit_store(eid):
    """
    Clean up expired rate limit records for the provided entity.

    Args:
        eid (str): The entity to clean up rate limit records for.
    """
    current_time = datetime.datetime.now()

    rows_deleted = (
        PasswordRateLimit.delete()
        .where(
            PasswordRateLimit.eid == eid,
            PasswordRateLimit.date_expires < current_time,
            PasswordRateLimit.attempt_count >= RATE_LIMIT_WINDOWS[-1]["count"],
        )
        .execute()
    )

    if rows_deleted > 0:
        logger.info("Cleaned up expired rate limit records for %s.", eid)


def clear_rate_limit(eid):
    """
    Clear the rate limit counter for the provided entity.

    Args:
        eid (str): The entity to clear the rate limit counter for.
    """
    row_deleted = (
        PasswordRateLimit.delete().where(PasswordRateLimit.eid == eid).execute()
    )

    if row_deleted > 0:
        logger.info("Cleared rate limit for %s.", eid)
