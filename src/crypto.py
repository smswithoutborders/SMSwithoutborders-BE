"""
Cryptographic functions.
"""

import hmac
import hashlib
from Crypto.Cipher import AES
from cryptography.fernet import Fernet
from base_logger import get_logger

logger = get_logger(__name__)


def encrypt_aes(key, plaintext):
    """
    Encrypts a plaintext string using AES-256 encryption.

    Args:
        key (bytes): The encryption key (must be 32 bytes long).
        plaintext (str): The plaintext string to be encrypted.

    Returns:
        bytes: The encrypted ciphertext.
    """
    if len(key) != 32:
        raise ValueError("AES-256 key must be 32 bytes long")

    logger.debug("Encrypting plaintext using AES-256...")
    cipher = AES.new(key, AES.MODE_EAX)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode("utf-8"))
    return cipher.nonce + tag + ciphertext


def decrypt_aes(key, ciphertext):
    """
    Decrypts a ciphertext string using AES-256 encryption.

    Args:
        key (bytes): The decryption key (must be 32 bytes long).
        ciphertext (bytes): The encrypted ciphertext.

    Returns:
        str: The decrypted plaintext string.
    """
    if len(key) != 32:
        raise ValueError("AES-256 key must be 32 bytes long")

    logger.debug("Decrypting ciphertext using AES-256...")
    nonce = ciphertext[:16]
    tag = ciphertext[16:32]
    ciphertext = ciphertext[32:]
    cipher = AES.new(key, AES.MODE_EAX, nonce=nonce)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return plaintext.decode("utf-8")


def generate_hmac(key, message):
    """
    Generates an HMAC for a given message using the provided key.

    Args:
        key (bytes): The key for HMAC generation (must be 32 bytes long).
        message (str): The message for which the HMAC is to be generated.

    Returns:
        str: The generated HMAC as a hexadecimal string.
    """
    if len(key) != 32:
        raise ValueError("HMAC key must be 32 bytes long")

    logger.debug("Generating HMAC for the message...")
    return hmac.new(key, message.encode("utf-8"), hashlib.sha512).hexdigest()


def verify_hmac(key, message, hmac_to_verify):
    """
    Verifies the HMAC of a given message against a provided HMAC.

    Args:
        key (bytes): The key for HMAC generation (must be 32 bytes long).
        message (str): The message whose HMAC is to be verified.
        hmac_to_verify (str): The HMAC to verify against.

    Returns:
        bool: True if the HMAC is valid, False otherwise.
    """
    if len(key) != 32:
        raise ValueError("HMAC key must be 32 bytes long")

    logger.debug("Verifying HMAC for the message...")
    generated_hmac = generate_hmac(key, message)
    return hmac.compare_digest(generated_hmac, hmac_to_verify)


def encrypt_fernet(key, plaintext):
    """
    Encrypts a plaintext string using Fernet encryption.

    Args:
        key (bytes): The encryption key (must be 32 bytes long).
        plaintext (str): The plaintext string to be encrypted.

    Returns:
        bytes: The encrypted ciphertext.
    """
    logger.debug("Encrypting plaintext using Fernet encryption...")
    fernet = Fernet(key)
    return fernet.encrypt(plaintext.encode("utf-8"))


def decrypt_fernet(key, ciphertext):
    """
    Decrypts a ciphertext string using Fernet encryption.

    Args:
        key (bytes): The decryption key (must be 32 bytes long).
        ciphertext (bytes): The encrypted ciphertext.

    Returns:
        str: The decrypted plaintext string.
    """
    logger.debug("Decrypting ciphertext using Fernet encryption...")
    fernet = Fernet(key)
    return fernet.decrypt(ciphertext).decode("utf-8")
