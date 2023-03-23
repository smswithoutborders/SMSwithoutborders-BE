"""Password Policy Module"""

import logging

from werkzeug.exceptions import BadRequest

logger = logging.getLogger(__name__)


def password_check(password: str) -> bool:
    """Check if password follows policy

    Keyword arguments:
    password -- Password provided

    return: str
    """

    if len(password) < 8:
        msg = "Password length should be at least 8"
        logger.error("[!] %s", msg)
        raise BadRequest(msg)

    logger.info("[x] Password Conforms to Password Policy.")
    return True
