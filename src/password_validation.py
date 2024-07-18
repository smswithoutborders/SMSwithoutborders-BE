"""
Module for validating password strength and checking if passwords
have been compromised using the Have I Been Pwned API.
"""

import logging
import hashlib
import requests

logger = logging.getLogger(__name__)


def validate_password_strength(password):
    """
    Validate password strength based on length, character types,
    and check if it has been compromised using the Have I Been Pwned API.

    Args:
        password (str): Password to validate.

    Returns:
        str or None: None if password is valid, otherwise a string
                     with reasons why the password is invalid prefixed
                     with "Password validation failed: ".
    """
    invalid_password = []

    if len(password) < 8:
        return "Password must be at least 8 characters long"

    if not any(c.islower() for c in password):
        return "Password must include at least one lowercase letter (a-z)"

    if not any(c.isupper() for c in password):
        return "Password must include at least one uppercase letter (A-Z)"

    if not any(c.isdigit() for c in password):
        return "Password must include at least one number (0-9)"

    if not any(c in "!@#$%^&*()_+-=" for c in password):
        return (
            "Password must include at least one special character from the "
            "following set: !@#$%^&*()_+-="
        )

    if not invalid_password:
        password_hash = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
        prefix, suffix = password_hash[:5], password_hash[5:]
        url = f"https://api.pwnedpasswords.com/range/{prefix}"

        try:
            response = requests.get(url, timeout=5)
            if response.ok:
                for line in response.text.splitlines():
                    if line.split(":")[0] == suffix:
                        return (
                            "This password has been found in a data breach and should not be used. "
                            "Please choose a different password."
                        )
            else:
                logger.error(
                    "Failed to check password against the Have I Been Pwned database"
                )
        except requests.RequestException as e:
            logger.error(
                "Error checking password against Have I Been Pwned database: %s", e
            )

    return None
