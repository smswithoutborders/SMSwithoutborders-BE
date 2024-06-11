"""Utitlies Module."""

import os
import logging
import uuid
import json
import base64
from functools import wraps

from cryptography.hazmat.primitives.asymmetric import x25519 as x25519_core
import mysql.connector
from peewee import DatabaseError
from smswithoutborders_libsig.keypairs import x25519

from src.crypto import encrypt_aes, decrypt_aes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_key(filepath, key_length):
    """
    Load a key from a file.

    This function reads the first line from the specified
    file and returns the specified number of characters
    from that line, encoded as bytes.

    Args:
        filepath (str): The path to the file containing the key.
        key_length (int): The number of characters to load from the first line.

    Returns:
        bytes: The specified number of characters from the first line in the file
            encoded as bytes.

    Raises:
        FileNotFoundError: If the file does not exist at the specified filepath.
        Exception: If an unexpected error occurs during file reading.
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            key = f.readline().strip()[:key_length]
            return key.encode("utf-8")
    except FileNotFoundError:
        logger.error(
            "Key file not found at %s. Please check the configuration.",
            filepath,
        )
        raise
    except Exception as e:
        logger.critical("An unexpected error occurred while loading the key: %s", e)
        raise


def create_tables(models):
    """
    Creates tables for the given models if they don't
        exist in their specified database.

    Args:
        models(list): A list of Peewee Model classes.
    """
    if not models:
        logger.warning("No models provided for table creation.")
        return

    try:
        databases = {}
        for model in models:
            database = model._meta.database
            if database not in databases:
                databases[database] = []
            databases[database].append(model)

        for database, db_models in databases.items():
            with database.atomic():
                existing_tables = set(database.get_tables())
                tables_to_create = [
                    model
                    for model in db_models
                    if model._meta.table_name not in existing_tables
                ]

                if tables_to_create:
                    database.create_tables(tables_to_create)
                    logger.info(
                        "Created tables: %s",
                        [model._meta.table_name for model in tables_to_create],
                    )
                else:
                    logger.debug("No new tables to create.")

    except DatabaseError as e:
        logger.error("An error occurred while creating tables: %s", e)


def ensure_database_exists(host, user, password, database_name):
    """
    Decorator that ensures a MySQL database exists before executing a function.

    Args:
        host (str): The host address of the MySQL server.
        user (str): The username for connecting to the MySQL server.
        password (str): The password for connecting to the MySQL server.
        database_name (str): The name of the database to ensure existence.

    Returns:
        function: Decorated function.
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                with mysql.connector.connect(
                    host=host, user=user, password=password
                ) as connection:
                    with connection.cursor() as cursor:
                        sql = "CREATE DATABASE IF NOT EXISTS " + database_name
                        cursor.execute(sql)

            except mysql.connector.Error as error:
                logger.error("Failed to create database: %s", error)

            return func(*args, **kwargs)

        return wrapper

    return decorator


def get_configs(config_name: str, strict: bool = False) -> str:
    """
    Retrieves the value of a configuration from the environment variables.

    Args:
        config_name (str): The name of the configuration to retrieve.
        strict (bool): If True, raises an error if the configuration is not found. Default is False.

    Returns:
        str: The value of the configuration, or None if not found and strict is False.

    Raises:
        KeyError: If the configuration is not found and strict is True.
        ValueError: If the configuration value is empty and strict is True.
    """
    try:
        value = os.environ[config_name] if strict else os.environ.get(config_name)
        if strict and (value is None or value.strip() == ""):
            raise ValueError(f"Configuration '{config_name}' is missing or empty.")
        return value
    except KeyError as error:
        logger.error(
            "Configuration '%s' not found in environment variables: %s",
            config_name,
            error,
        )
        raise
    except ValueError as error:
        logger.error("Configuration '%s' is empty: %s", config_name, error)
        raise


def set_configs(config_name, config_value) -> None:
    """
    Sets the value of a configuration in the environment variables.

    Args:
        config_name (str): The name of the configuration to set.
        config_value (str or bool): The value of the configuration to set.

    Raises:
        ValueError: If config_name is empty.
    """
    if not config_name:
        error_message = (
            f"Cannot set configuration. Invalid config_name '{config_name}'."
        )
        logger.error(error_message)
        raise ValueError(error_message)

    try:
        if isinstance(config_value, bool):
            config_value = str(config_value).lower()
        os.environ[config_name] = str(config_value)
    except Exception as error:
        logger.error("Failed to set configuration '%s': %s", config_name, error)
        raise


def generate_eid(phone_number_hash, namespace=uuid.NAMESPACE_DNS):
    """
    Generate a UUID based on a phone number hash using UUID5.

    Parameters:
    - phone_number_hash (str): The hash of the phone number.
    - namespace (uuid.UUID): The namespace identifier. Defaults to uuid.NAMESPACE_DNS.

    Returns:
    - str: The hexadecimal representation of the generated UUID.
    """
    return uuid.uuid5(namespace, phone_number_hash).hex


def generate_keypair_and_public_key(keystore_path):
    """
    Generate keypair and public key.

    Args:
        keystore_path (str): Path to the keystore file.

    Returns:
        tuple: Tuple containing keypair object and public key.
    """
    if os.path.isfile(keystore_path):
        os.remove(keystore_path)

    keypair_obj = x25519(keystore_path)
    peer_pub_key = keypair_obj.init()
    return keypair_obj, peer_pub_key


def get_shared_key(keystore_path, pnt_keystore, secret_key, peer_pub_key):
    """
    Generate a shared key.

    Args:
        keystore_path (str): Path to the keystore file.
        pnt_keystore (str): The keystore pointer.
        secret_key (bytes): Secret key used for the keypair.
        peer_pub_key (bytes): Public key of the peer to generate the shared key with.

    Returns:
        bytes: The generated shared key.
    """
    keypair_obj = x25519(keystore_path, pnt_keystore, secret_key)
    shared_key = keypair_obj.agree(peer_pub_key)
    return shared_key


def generate_crypto_metadata(publish_keypair, device_id_keypair):
    """
    Generate cryptographic metadata.

    Args:
        publish_keypair: Publish keypair object.
        device_id_keypair: Device ID keypair object.

    Returns:
        str: JSON string representing cryptographic metadata.
    """
    crypto_metadata = {
        "publish_keypair": {
            "pnt_keystore": publish_keypair.pnt_keystore,
            "secret_key": publish_keypair.secret_key,
        },
        "device_id_keypair": {
            "pnt_keystore": device_id_keypair.pnt_keystore,
            "secret_key": device_id_keypair.secret_key,
        },
    }

    return json.dumps(crypto_metadata)


def load_crypto_metadata(metadata):
    """
    Load cryptographic metadata.

    Args:
        metadata (str): JSON string representing cryptographic metadata.

    Returns:
        CryptoMetadata: Object representing cryptographic metadata.
    """

    class CryptoMetadata:
        """
        Represents cryptographic metadata.
        """

        def __init__(self, metadata):
            self.__dict__.update(self._convert(json.loads(metadata)))

        def _convert(self, data):
            for key, value in data.items():
                if isinstance(value, dict):
                    data[key] = CryptoMetadata(json.dumps(value))
                elif isinstance(value, list):
                    data[key] = [
                        (
                            CryptoMetadata(json.dumps(item))
                            if isinstance(item, dict)
                            else item
                        )
                        for item in value
                    ]
            return data

        def __getattr__(self, name):
            try:
                return self.__dict__[name]
            except KeyError as exc:
                raise AttributeError(
                    f"'CryptoMetadata' object has no attribute '{name}'"
                ) from exc

        def __setattr__(self, name, value):
            self.__dict__[name] = value

    return CryptoMetadata(metadata)


def encrypt_and_encode(plaintext):
    """
    Encrypt and encode plaintext.

    Args:
        plaintext (str): Plaintext to encrypt and encode.

    Returns:
        str: Base64 encoded ciphertext.
    """
    encryption_key = load_key(get_configs("SHARED_KEY"), 32)

    return base64.b64encode(
        encrypt_aes(
            encryption_key,
            plaintext,
        )
    ).decode("utf-8")


def decrypt_and_decode(encoded_ciphertext):
    """
    Decode and decrypt encoded ciphertext.

    Args:
        encoded_ciphertext (str): Base64 encoded ciphertext to decode and decrypt.

    Returns:
        str: Decrypted plaintext.
    """
    encryption_key = load_key(get_configs("SHARED_KEY"), 32)

    ciphertext = base64.b64decode(encoded_ciphertext)
    return decrypt_aes(encryption_key, ciphertext)


def convert_to_fernet_key(secret_key):
    """
    Converts a secret key to a Fernet key.

    Args:
        secret_key (bytes): The secret key (must be 32 bytes long).

    Returns:
        bytes: The base64-encoded Fernet key.
    """
    if len(secret_key) != 32:
        raise ValueError("Secret key must be 32 bytes long")

    return base64.urlsafe_b64encode(secret_key)


def is_valid_x25519_public_key(encoded_key):
    """
    Validates an X25519 public key encoded in base64.

    Args:
        encoded_key (bytes): The base64-encoded public key to validate.

    Returns:
        tuple[bool, str]: A tuple where the first element is a boolean i
            ndicating whether the key is valid, and the second element is an
            error message if the key is invalid, or None if the key
            is valid.
    """
    try:
        decoded_key = base64.b64decode(encoded_key)
    except (TypeError, ValueError) as err:
        logger.exception("Base64 decoding error: %s", err)
        return False, "Invalid base64 encoding"

    try:
        x25519_core.X25519PublicKey.from_public_bytes(decoded_key)
        return True, None
    except ValueError as err:
        logger.exception("X25519 public key validation error: %s", err)
        return False, f"Invalid X25519 public key: {err}"
