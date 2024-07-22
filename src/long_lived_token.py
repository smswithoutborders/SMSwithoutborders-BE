"""
Module for generating and verifying Long-Lived Tokens (LLTs).
"""

import logging
from datetime import datetime, timedelta
import base64

from jwt import JWT, jwk_from_dict
from jwt.utils import get_int_from_datetime

from src.crypto import encrypt_fernet
from src.utils import convert_to_fernet_key

logging.basicConfig(
    level=logging.INFO, format=("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
)
logger = logging.getLogger(__name__)


def generate_llt(eid, key):
    """
    Generate a Long-Lived Token (LLT) for the given entity ID (eid).

    Args:
        eid (str): The entity ID for which LLT is generated.
        key (bytes): The key used for encryption.

    Returns:
        str: Base64 encoded and encrypted LLT.
    """
    token_obj = JWT()

    payload = {
        "eid": eid,
        "iss": "https://smswithoutborders.com",
        "iat": get_int_from_datetime(datetime.now()),
        "exp": get_int_from_datetime(datetime.now() + timedelta(days=3650)),
    }

    signing_key = jwk_from_dict(
        {"kty": "oct", "k": base64.urlsafe_b64encode(key).decode("utf-8")}
    )

    llt = token_obj.encode(payload, signing_key, alg="HS256")
    llt_ciphertext = encrypt_fernet(convert_to_fernet_key(key), f"{eid}:{llt}")

    logger.info("Successfully generated long-lived token.")
    return base64.b64encode(llt_ciphertext).decode("utf-8")


def verify_llt(llt, key):
    """
    Verify the integrity and authenticity of a Long-Lived Token (LLT).

    Args:
        llt (str): The LLT to be verified.
        key (bytes): The key used for encryption.

    Returns:
        tuple: A tuple containing two items:
            - dict or None: The decoded payload of the LLT if valid, None otherwise.
            - str or None: Error message if LLT is invalid or expired, None if LLT is valid.
    """
    try:
        token_obj = JWT()
        signing_key = jwk_from_dict(
            {"kty": "oct", "k": base64.urlsafe_b64encode(key).decode("utf-8")}
        )
        payload = token_obj.decode(llt, signing_key, algorithms=["HS256"])
        logger.info("Successfully verified long-lived token.")
        return payload, None

    except Exception as error:
        logger.error("Error verifying long-lived token: %s", error)
        return None, error
