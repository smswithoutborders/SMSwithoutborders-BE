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
    e_key = open(Configurations.SHARED_KEY, "r", encoding="utf-8").readline().strip()
    salt = open(Configurations.HASHING_SALT, "r", encoding="utf-8").readline().strip()
else:
    from src.schemas.credentials import Credentials
    creds = Credentials.get(Credentials.id == 1)
    e_key = creds.shared_key
    salt = creds.hashing_salt

logger = logging.getLogger(__name__)

class Data:
    """
    Encrypt, decrypt and hash data.

    Attributes:
        key: str (optional)
    
    Methods:
        encrypt(data: str, iv: str = None) -> dict,
        decrypt(data: str, iv: str) -> str,
        hash(data: str, salt: str = None) -> str
    """
    def __init__(self, key:str = None) -> None:
        """
        Arguments:
            key: str (optional)
        """
        self.key_bytes = 32
        self.key = e_key.encode("utf8")[:self.key_bytes] if not key else key.encode("utf8")[:self.key_bytes]
        self.salt = salt.encode("utf-8")

        if not len(self.key) == self.key_bytes:
            raise InternalServerError("Invalid encryption key length. Key >= %d bytes", self.key_bytes)

    def encrypt(self, data: str) -> dict:
        """
        Encrypt data.

        Arguments:
            data: str,

        Returns:
            dict
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
        Decrypt data.

        Arguments:
            data: str,
        
        Returns:
            str
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
            cleared_text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', ciphertext)

            return cleared_text

        except (ValueError, KeyError) as error:
            logger.exception(error)
            raise Unauthorized()

    def hash(self, data: str, salt: str = None) -> str:
        """
        Hash data.

        Arguments:
            data: str,
            salt: str (optional)

        Returns:
            str
        """
        logger.debug("starting data hashing ...")
        hash_data = hmac.new(self.salt if not salt else salt, data.encode("utf-8"), hashlib.sha512)
        logger.info("- Successfully hashed data")
        return str(hash_data.hexdigest())
