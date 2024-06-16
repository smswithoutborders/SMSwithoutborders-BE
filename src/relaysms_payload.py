"""Module for decoding and extracting information from RelaySMS payloads."""

import logging
import base64
import struct
from smswithoutborders_libsig.ratchets import Ratchets, States, HEADERS

logging.basicConfig(
    level=logging.INFO, format=("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
)
logger = logging.getLogger(__name__)


def initialize_ratchet(
    server_state, keypair, ratchet_header, encrypted_content, **kwargs
):
    """
    Initialize a ratchet.

    Args:
        server_state (bytes or None): Current state of the server-side
            ratchet. If None, initializes a new state.
        keypair (object): Key pair object containing keys for encryption
            and decryption.
        ratchet_header (bytes): The ratchet header containing metadata for
            the ratchet protocol.
        encrypted_content (bytes): Encrypted content to be decrypted.
        kwargs (dict): Additional keyword arguments:
            - publish_shared_key (bytes): The shared key object to publish.
            - client_pub_key (bytes): The client's public key for decryption.

    Returns:
        tuple:
            - plaintext (str): Decrypted plaintext content.
            - state (bytes): Updated server state.
    """
    if not server_state:
        state = States()
    else:
        state = States.deserialize(server_state)

    publish_shared_key = kwargs.get("publish_shared_key")
    client_pub_key = kwargs.get("client_pub_key")

    Ratchets.bob_init(state, publish_shared_key, keypair)
    logger.info("Ratchet initialized successfully.")

    header = HEADERS(keypair)
    header.deserialize(ratchet_header)
    logger.info("Header deserialized successfully.")

    plaintext = Ratchets.decrypt(state, header, encrypted_content, client_pub_key)
    logger.info("Content decrypted successfully.")

    return plaintext, state


def decode_relay_sms_payload(content):
    """
    Decode a relay SMS payload containing a header and encrypted content.

    Args:
    - content (str): Base64-encoded string representing the payload.

    Returns:
    - tuple:
        - header (bytes): The ratchet header containing metadata for
            the ratchet protocol.
        - encrypted content (bytes): The encrypted payload.
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

        return header, encrypted_content

    except (struct.error, IndexError, base64.binascii.Error) as e:
        raise ValueError("Invalid payload format") from e
