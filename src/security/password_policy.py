"""Password Policy Module"""

import logging
import hashlib
import requests

from werkzeug.exceptions import BadRequest

logger = logging.getLogger(__name__)


def check_password_policy(password) -> bool:
    """
    Checks if a password complies with a password policy that includes the following rules:
    - Length: Passwords should be at least 8 characters long.
    - Complexity: Passwords should include a combination of uppercase and lowercase letters, numbers, and relevant special characters.
    - Frequency: Passwords should not have been previously compromised in a data breach.

    Args:
        password (str): The password to check.

    Returns:
        bool: True if the password complies with the password policy, False otherwise.
    """

    # Check length
    if len(password) < 8:
        message = "Password must be at least 8 characters long"
        logger.error(message)
        raise BadRequest(message)
    # Check complexity
    if not any(c.islower() for c in password):
        message = "Password must include at least one lowercase letter"
        logger.error(message)
        raise BadRequest(message)

    if not any(c.isupper() for c in password):
        message = "Password must include at least one uppercase letter"
        logger.error(message)
        raise BadRequest(message)

    if not any(c.isdigit() for c in password):
        message = "Password must include at least one number"
        logger.error(message)
        raise BadRequest(message)

    if not any(c in "!@#$%^&*()_+-=" for c in password):
        message = "Password must include at least one of the following special characters: !@#$%^&*()_+-="
        logger.error(message)
        raise BadRequest(message)

    # Check if password has been previously compromised in a data breach
    password_hash = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
    prefix, suffix = password_hash[:5], password_hash[5:]
    response = requests.get(f"https://api.pwnedpasswords.com/range/{prefix}")

    if response.status_code != 200:
        logger.error(
            "Unable to check password against Have I Been Pwned database")
        return True

    for line in response.text.splitlines():
        if line.split(":")[0] == suffix:
            message = "Password has previously been compromised in a data breach. Use another password"
            logger.error(message)
            raise BadRequest(message)

    # If all checks pass, return True
    return True
