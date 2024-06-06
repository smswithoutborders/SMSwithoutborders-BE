"""Test module for Long-Lived Tokens."""

import os
import base64
import pytest
from src.utils import generate_eid, convert_to_fernet_key
from src.long_lived_token import generate_llt, verify_llt
from src.crypto import decrypt_fernet


@pytest.fixture
def encryption_key():
    """Fixture to generate an encryption key."""
    return os.urandom(32)


def test_generate_llt(encryption_key):
    """Test the generation of a Long-Lived Token."""
    eid = generate_eid("sample_data")
    llt_ciphertext = generate_llt(eid, encryption_key)
    decoded_llt = base64.b64decode(llt_ciphertext)

    assert isinstance(decoded_llt, bytes)


def test_verify_llt_valid(encryption_key):
    """Test the verification of a valid Long-Lived Token."""
    eid = generate_eid("sample_data")
    llt_ciphertext = generate_llt(eid, encryption_key)
    llt_plaintext = decrypt_fernet(
        convert_to_fernet_key(encryption_key), base64.b64decode(llt_ciphertext)
    )
    payload, error = verify_llt(llt_plaintext, encryption_key)

    assert payload is not None
    assert error is None
    assert isinstance(payload, dict)
    assert payload["eid"] == eid


def test_verify_llt_invalid(encryption_key):
    """Test the verification of an invalid Long-Lived Token."""
    eid = generate_eid("sample_data")
    llt_ciphertext = generate_llt(eid, encryption_key)
    llt_plaintext = decrypt_fernet(
        convert_to_fernet_key(encryption_key), base64.b64decode(llt_ciphertext)
    )
    manipulated_llt = llt_plaintext[:-1]
    payload, error = verify_llt(manipulated_llt, encryption_key)

    assert payload is None
    assert error is not None
    assert isinstance(error, str)
    assert "Failed to verify LLT." in error
