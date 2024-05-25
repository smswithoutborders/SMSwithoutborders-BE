"""Test module for cryptographic functions."""

import os
import pytest
from src.crypto import encrypt_aes, decrypt_aes, generate_hmac, verify_hmac


@pytest.fixture
def aes_key():
    """Fixture that generates a random AES-128 key."""
    return os.urandom(32)


@pytest.fixture
def plaintext():
    """Fixture that provides a sample plaintext message for AES encryption."""
    return "This is a test message."


@pytest.fixture
def message():
    """Fixture that provides a sample message for HMAC generation."""
    return "This is a HMAC test message."


@pytest.fixture
def hmac_key():
    """Fixture that generates a random key for HMAC."""
    return os.urandom(32)


def test_encrypt_decrypt_aes(aes_key, plaintext):
    """Test that encrypts and then decrypts a message using AES,
    verifying the result matches the original plaintext.
    """
    ciphertext = encrypt_aes(aes_key, plaintext)
    decrypted_text = decrypt_aes(aes_key, ciphertext)
    assert decrypted_text == plaintext


def test_decrypt_tampered_ciphertext(aes_key, plaintext):
    """Test that decrypts tampered ciphertext, verifying decryption fails."""
    ciphertext = encrypt_aes(aes_key, plaintext)
    tampered_ciphertext = bytearray(ciphertext)
    tampered_ciphertext[0] ^= 1
    with pytest.raises(ValueError):
        decrypt_aes(aes_key, tampered_ciphertext)


def test_decrypt_with_wrong_key(aes_key, plaintext):
    """Test that decrypts ciphertext with a wrong key, verifying decryption fails."""
    ciphertext = encrypt_aes(aes_key, plaintext)
    wrong_key = os.urandom(16)
    with pytest.raises(ValueError):
        decrypt_aes(wrong_key, ciphertext)


def test_encrypt_decrypt_empty_message(aes_key):
    """Test that encrypts and then decrypts an empty message using AES."""
    empty_plaintext = ""
    ciphertext = encrypt_aes(aes_key, empty_plaintext)
    decrypted_text = decrypt_aes(aes_key, ciphertext)
    assert decrypted_text == empty_plaintext


def test_encrypt_decrypt_long_message(aes_key):
    """Test that encrypts and then decrypts a long message using AES."""
    long_plaintext = (
        "This is a very long message to test AES encryption and decryption." * 1000
    )
    ciphertext = encrypt_aes(aes_key, long_plaintext)
    decrypted_text = decrypt_aes(aes_key, ciphertext)
    assert decrypted_text == long_plaintext


def test_invalid_aes_key_length():
    """Test that raises an error when an invalid AES key length is provided."""
    invalid_key_lengths = [8, 12, 24, 34]
    for key_length in invalid_key_lengths:
        with pytest.raises(ValueError):
            invalid_aes_key = os.urandom(key_length)
            encrypt_aes(invalid_aes_key, "Test message")


def test_generate_verify_hmac(hmac_key, message):
    """Test that generates an HMAC for a message and verifies it,
    checking the verification is successful.
    """
    generated_hmac = generate_hmac(hmac_key, message)
    assert verify_hmac(hmac_key, message, generated_hmac) is True


def test_verify_hmac_with_wrong_message(hmac_key, message):
    """Test that verifies an HMAC with an incorrect message,
    checking the verification fails."""
    generated_hmac = generate_hmac(hmac_key, message)
    wrong_message = "This is a wrong message."
    assert verify_hmac(hmac_key, wrong_message, generated_hmac) is False


def test_verify_hmac_with_wrong_hmac(hmac_key, message):
    """Test that verifies a message with an incorrect HMAC,
    checking the verification fails."""
    wrong_hmac = generate_hmac(hmac_key, "This is a wrong message.")
    assert verify_hmac(hmac_key, message, wrong_hmac) is False


def test_generate_verify_hmac_empty_message(hmac_key):
    """Test that generates and verifies an HMAC for an empty message."""
    empty_message = ""
    generated_hmac = generate_hmac(hmac_key, empty_message)
    assert verify_hmac(hmac_key, empty_message, generated_hmac) is True


def test_invalid_hmac_key_length():
    """Test that raises an error when an invalid HMAC key length is provided."""
    invalid_key_lengths = [8, 12, 24, 34]
    for key_length in invalid_key_lengths:
        with pytest.raises(ValueError):
            invalid_hmac_key = os.urandom(key_length)
            generate_hmac(invalid_hmac_key, "Test message")
