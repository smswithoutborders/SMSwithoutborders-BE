"""Module for decoding and extracting information from RelaySMS payloads."""

import base64
import struct
from smswithoutborders_libsig.ratchets import Ratchets


def initialize_ratchet(
    state, share_key, keypair_obj, header, ciphertext, client_public_key
):
    """
    Initialize a ratchet.

    Args:
    - state (obj): State object for ratchet initialization.
    - share_key (bytes): Shared key for cryptographic operations.
    - keypair_obj (obj): Object containing keypair information.
    - header (bytes): Encrypted header data to decrypt.
    - ciphertext (bytes): Encrypted content data.
    - client_public_key (bytes): Public key of the client.

    Returns:
    - bytes: Decrypted plaintext header.
    """

    Ratchets.bob_init(state, share_key, keypair_obj)
    plaintext_header = Ratchets.decrypt(state, header, ciphertext, client_public_key)
    return plaintext_header


def decode_relay_sms_payload(content):
    """
    Decode a relay SMS payload containing a header and encrypted content.

    Args:
    - content (str): Base64-encoded string representing the payload.

    Returns:
    - tuple: A tuple containing the header (bytes) and encrypted content (bytes).

    Raises:
    - ValueError: If the payload format is invalid or decoding fails.
    """
    if not isinstance(content, str) or not content:
        raise ValueError("Invalid input: content must be a non-empty string")

    try:
        # Decode base64 content
        payload = base64.b64decode(content)

        # Extract length of header
        len_header = struct.unpack("<i", payload[:4])[0]

        # Extract header and encrypted content
        header = payload[4 : 4 + len_header]
        encrypted_content = payload[4 + len_header :]

        return header, encrypted_content

    except (struct.error, IndexError, base64.binascii.Error) as e:
        raise ValueError("Invalid payload format") from e
