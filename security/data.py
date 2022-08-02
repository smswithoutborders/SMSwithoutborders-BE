import logging
logger = logging.getLogger(__name__)

from Configs import baseConfig
config = baseConfig()
api = config["API"]
salt = api["SALT"]
e_key = api["KEY"]

import hashlib
import hmac
from base64 import b64encode, b64decode
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
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
        self.iv_bytes = Random.new().read(AES.block_size)
        self.iv = b64encode(self.iv_bytes).decode('utf-8')

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
        cipher = AES.new(self.key, AES.MODE_CBC, self.iv_bytes if not iv else iv)

        if not data:
            result = {'e_data':None}

            logger.info("- Nothing to encrypt")
            return result        
        else:
            data_bytes = data.encode()
            ct_bytes = cipher.encrypt(pad(data_bytes, AES.block_size))
            ct_iv = b64encode(cipher.iv).decode('utf-8')
            ct = b64encode(ct_bytes).decode('utf-8')
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
                iv_bytes = b64decode(iv)
                ct = b64decode(data)
                cipher = AES.new(self.key, AES.MODE_CBC, iv_bytes)
                pt = unpad(cipher.decrypt(ct), AES.block_size).decode("utf-8")

                logger.info("- Successfully decryted data")
                return pt
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
