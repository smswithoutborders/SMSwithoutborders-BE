import logging
logger = logging.getLogger(__name__)

from src.schemas.credentials import Credentials
creds = Credentials.get(Credentials.id == 1)
e_key = creds.shared_key
salt = creds.hashing_salt

import string
import hashlib
import hmac
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from Crypto import Random

from werkzeug.exceptions import InternalServerError
from werkzeug.exceptions import Unauthorized

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
        self.iv = Random.new().read(AES.block_size).hex()[:16].encode("utf-8")
        
        if not len(self.key) == self.key_bytes:
            raise InternalServerError("Invalid encryption key length. Key >= %d bytes" % self.key_bytes)
    
    def encrypt(self, data: str, iv: str = None) -> dict:
        """
        Encrypt data.

        Arguments:
            data: str,
            iv: str (optional)

        Returns:
            dict
        """
        logger.debug("starting data encryption ...")

        if not data:
            result = {'e_data':None}

            logger.info("- Nothing to encrypt")
            return result        
        else:
            data_bytes = data.encode("utf-8")
            iv_bytes = None if not iv else iv.encode("utf-8")
            cipher = AES.new(self.key, AES.MODE_CBC, self.iv if not iv_bytes else iv_bytes)
            ct_bytes = cipher.encrypt(pad(data_bytes, 16))
            ct_iv = cipher.iv.decode("utf-8")
            ct = ct_bytes.hex()

            result = {'iv':ct_iv, 'e_data':ct}

            logger.info("- Successfully encryted data")
            return result

    def decrypt(self, data: str, iv: str) -> str:
        """
        Decrypt data.

        Arguments:
            data: str,
            iv: str
        
        Returns:
            str
        """
        try:
            logger.debug("starting data decryption ...")
            if not data:
                logger.info("- Nothing to decrypt")
                return None    
            else:
                str_data = bytes.fromhex(data)
                iv_bytes = iv.encode("utf8")
                cipher = AES.new(self.key, AES.MODE_CBC, iv_bytes)
                ciphertext = cipher.decrypt(str_data).decode("utf-8")
                cleared_text = ''.join(c for c in ciphertext if c in string.printable)

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
