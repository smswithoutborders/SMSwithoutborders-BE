import hashlib
import hmac
import re
import logging

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from Crypto import Random

from werkzeug.exceptions import InternalServerError
from werkzeug.exceptions import Unauthorized

from settings import Configurations

if Configurations.SHARED_KEY and Configurations.HASHING_SALT:
    e_key = open(Configurations.SHARED_KEY, "r",
                 encoding="utf-8").readline().strip()
    h_salt = open(Configurations.HASHING_SALT, "r",
                  encoding="utf-8").readline().strip()
else:
    from src.schemas.credentials import Credentials

    creds = Credentials.get(Credentials.id == 1)
    e_key = creds.shared_key
    h_salt = creds.hashing_salt

logger = logging.getLogger(__name__)


class Data:
    """
    This class provides methods to encrypt, decrypt and hash data.

    Attributes:
        key_bytes (int): Length of the encryption key in bytes.
        key (bytes): Encryption key used for encrypting and decrypting data.
        salt (bytes): Hashing salt used for hashing data.
    """

    def __init__(self, key: str = None) -> None:
        """
        Constructor method for the Data class.

        Args:
            key (str): The encryption key to use. If not provided, a default key will be used.
        Raises:
            InternalServerError: If an invalid encryption key is provided.
        """
        self.key_bytes = 32
        self.key = (
            e_key.encode("utf8")[: self.key_bytes]
            if not key
            else key.encode("utf8")[: self.key_bytes]
        )
        self.salt = h_salt.encode("utf-8")

        if not len(self.key) == self.key_bytes:
            raise InternalServerError(
                f"Invalid encryption key length. Key >= {self.key_bytes} bytes"
            )

    def encrypt(self, data: str) -> dict:
        """
        Encrypts the given data using AES-256-CBC encryption.

        Args:
            data (str): The data to be encrypted.

        Returns:
            str: Encrypted data, with initialization vector (IV) prepended.
            None: If no data to encrypt.
        """
        logger.debug("starting data encryption ...")

        iv = Random.new().read(AES.block_size).hex()[:16].encode("utf-8")

        if not data:
            logger.info("- Nothing to encrypt")
            return None

        data_bytes = data.encode("utf-8")
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        ct_bytes = cipher.encrypt(pad(data_bytes, 16))
        ct_iv = cipher.iv.decode("utf-8")
        ct = ct_bytes.hex()

        result = ct_iv + ct

        logger.info("- Successfully encryted data")

        return result

    def decrypt(self, data: str) -> str:
        """
        Decrypts the given data using AES-256-CBC encryption.

        Args:
            data (str): The data to be decrypted.

        Returns:
            str: Decrypted data.
            None: If no data to decrypt.

        Raises:
            Unauthorized: If an error occurs while decrypting the data.
        """
        try:
            logger.debug("starting data decryption ...")

            if not data:
                logger.info("- Nothing to decrypt")
                return None

            iv = data[:16]
            e_data = data[16:]

            str_data = bytes.fromhex(e_data)
            iv_bytes = iv.encode("utf8")
            cipher = AES.new(self.key, AES.MODE_CBC, iv_bytes)
            ciphertext = cipher.decrypt(str_data).decode("utf-8")
            cleared_text = re.sub(
                r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]", "", ciphertext
            )

            return cleared_text

        except (ValueError, KeyError) as error:
            logger.exception(error)
            raise Unauthorized() from error

    def hash(self, data: str, salt: str = None) -> str:
        """
        Hashes the given data using HMAC-SHA512 hashing algorithm.

        Args:
            data (str): The data to be hashed.
            salt (Optional[str]): The salt to be used in hashing the data. If not provided, 
                                  the salt from the object's attributes will be used.

        Returns:
            str: The hashed data.
        """
        logger.debug("starting data hashing ...")

        hash_data = hmac.new(
            self.salt if not salt else salt.encode("utf-8"),
            data.encode("utf-8"),
            hashlib.sha512,
        )
        logger.info("- Successfully hashed data")

        return str(hash_data.hexdigest())
