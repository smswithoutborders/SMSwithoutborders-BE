"""Password Policy Module"""

import logging

from werkzeug.exceptions import BadRequest

logger = logging.getLogger(__name__)


def password_check(password: str) -> bool:
    """
    Check if the given password conforms to the password policy.

    Args:
        password (str): The password to be checked.

    Returns:
        bool: True if password conforms to policy.

    Raises:
        BadRequest: If the password length is less than 8.

    """

    if len(password) < 8:
        msg = "Password length should be at least 8"
        logger.error("[!] %s", msg)
        raise BadRequest(msg)

    logger.info("[x] Password Conforms to Password Policy.")
    return True
