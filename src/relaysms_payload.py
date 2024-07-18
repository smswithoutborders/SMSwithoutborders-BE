"""
Module for handling encryption, decryption, encoding, and decoding of RelaySMS payloads.
"""

import logging
import base64
import struct
from smswithoutborders_libsig.ratchets import Ratchets, States, HEADERS

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def decrypt_payload(
    server_state, publish_keypair, ratchet_header, encrypted_content, **kwargs
):
    """
    Decrypts a RelaySMS payload.

    Args:
        server_state (bytes or None): Current state of the server-side ratchet.
            If None, initializes a new state.
        keypair (object): Object containing encryption and decryption keys.
        ratchet_header (bytes): Ratchet header.
        encrypted_content (bytes): Encrypted content to be decrypted.
        kwargs (dict): Additional keyword arguments:
            - publish_shared_key (bytes): Publish shared key.
            - client_pub_key (bytes): Client's public key for decryption.

    Returns:
        tuple:
            - plaintext (str): Decrypted plaintext content.
            - state (bytes): Updated server state.
            - error (Exception or None)
    """
    publish_shared_key = kwargs.get("publish_shared_key")
    publish_pub_key = kwargs.get("publish_pub_key")

    try:
        if not server_state:
            state = States()
            Ratchets.bob_init(state, publish_shared_key, publish_keypair)
            logger.info("Ratchet initialized successfully.")
        else:
            state = States.deserialize(server_state)

        header = HEADERS.deserialize(ratchet_header)
        logger.info("Header deserialized successfully.")

        plaintext = Ratchets.decrypt(state, header, encrypted_content, publish_pub_key)
        logger.info("Content decrypted successfully.")

        return plaintext, state, None
    except Exception as e:
        logger.error("Error decrypting relaysms payload: %s", e, exc_info=True)
        return None, None, e


def encrypt_payload(server_state, client_publish_pub_key, content):
    """
    Encrypts content into a RelaySMS payload.

    Args:
        server_state (bytes): Current state of the server-side ratchet.
        client_publish_pub_key (bytes): Client's public key for encryption.
        content (str): Plaintext content to encrypt.

    Returns:
        tuple:
            - header (bytes): Serialized ratchet header.
            - content_ciphertext (bytes): Encrypted content.
            - state (bytes): Updated server state.
            - error (Exception or None)
    """
    try:
        state = States.deserialize(server_state)

        header, content_ciphertext = Ratchets.encrypt(
            state, content.encode("utf-8"), client_publish_pub_key
        )

        return header.serialize(), content_ciphertext, state, None
    except Exception as e:
        logger.error("Error encrypting relaysms payload: %s", e, exc_info=True)
        return None, None, None, e


def decode_relay_sms_payload(content):
    """
    Decode a RelaySMS payload from a base64-encoded string.

    Args:
        content (str): Base64-encoded string representing the payload.

    Returns:
        tuple:
            - header (bytes): Ratchet header.
            - encrypted_content (bytes): Encrypted payload.
            - error (Exception or None)
    """
    try:
        payload = base64.b64decode(content)

        # Unpack the length of the header (first 4 bytes)
        len_header = struct.unpack("<i", payload[:4])[0]

        # Extract the header (next len_header bytes)
        header = payload[4 : 4 + len_header]

        # Extract the remaining payload as the encrypted content
        encrypted_content = payload[4 + len_header :]
        logger.info("Header and encrypted content extracted.")

        return header, encrypted_content, None

    except Exception as e:
        logger.error("Error decoding relaysms payload: %s", e, exc_info=True)
        return None, None, e


def encode_relay_sms_payload(header, content_ciphertext):
    """
    Encode a RelaySMS payload to a base64-encoded string.

    Args:
        header (bytes): Ratchet header.
        content_ciphertext (bytes): Encrypted content.

    Returns:
        tuple:
            - encrypted_payload (str): Base64-encoded representation of the payload.
            - error (Exception or None)
    """
    try:
        len_header = len(header)
        return (
            base64.b64encode(
                struct.pack("<i", len_header) + header + content_ciphertext
            ).decode("utf-8"),
            None,
        )

    except Exception as e:
        logger.error("Error encoding relaysms payload: %s", e, exc_info=True)
        return None, e