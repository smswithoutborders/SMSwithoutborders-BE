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
        invalid_password.append("must be at least 8 characters long")

    if not any(c.islower() for c in password):
        invalid_password.append("must include at least one lowercase letter")

    if not any(c.isupper() for c in password):
        invalid_password.append("must include at least one uppercase letter")

    if not any(c.isdigit() for c in password):
        invalid_password.append("must include at least one number")

    if not any(c in "!@#$%^&*()_+-=" for c in password):
        invalid_password.append(
            "must include at least one of the following special characters: !@#$%^&*()_+-="
        )

    password_hash = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
    prefix, suffix = password_hash[:5], password_hash[5:]
    url = f"https://api.pwnedpasswords.com/range/{prefix}"

    response = requests.get(url, timeout=5)
    if not response.ok:
        logger.error("Unable to check password against Have I Been Pwned database")

    for line in response.text.splitlines():
        if line.split(":")[0] == suffix:
            invalid_password.append(
                "has previously been compromised in a data breach. Use another password"
            )

    if invalid_password:
        return "Password " + ", ".join(invalid_password)

    return None
