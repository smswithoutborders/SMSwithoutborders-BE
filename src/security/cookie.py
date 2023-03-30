import logging
from base64 import b64encode, b64decode

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto import Random

from werkzeug.exceptions import InternalServerError
from werkzeug.exceptions import Unauthorized

from settings import Configurations

if Configurations.SHARED_KEY and Configurations.HASHING_SALT:
    e_key = open(Configurations.SHARED_KEY, "r", encoding="utf-8").readline().strip()
else:
    from src.schemas.credentials import Credentials

    creds = Credentials.get(Credentials.id == 1)
    e_key = creds.shared_key

logger = logging.getLogger(__name__)


class Cookie:
    """
    Encrypt and decrypt cookie data.

    Attributes:
        key = str (optional)

    Methods:
        encrypt(data: str, iv: str = None) -> str,
        decrypt(data: str) -> str
    """

    def __init__(self, key: str = None) -> None:
        """
        Arguments:
            key: str (optional)
        """
        self.key_bytes = 32
        self.key = (
            e_key.encode("utf8")[: self.key_bytes]
            if not key
            else key.encode("utf8")[: self.key_bytes]
        )

        if not len(self.key) == self.key_bytes:
            raise InternalServerError(
                f"Invalid encryption key length. Key >= {self.key_bytes} bytes"
            )

    def encrypt(self, data: str) -> str:
        """
        Encrypt cookie data.

        Arguments:
            data: str,

        Returns:
            dict
        """

        logger.debug("starting cookie encryption ...")

        iv = Random.new().read(AES.block_size)

        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        data_bytes = data.encode()
        ct_bytes = cipher.encrypt(pad(data_bytes, AES.block_size))
        ct = b64encode(iv + ct_bytes).decode("utf-8")

        logger.info("- Successfully encryted cookie")

        return ct

    def decrypt(self, data: str) -> str:
        """
        Decrypt cookie data.

        Arguments:
            data: str

        Returns:
            str
        """

        try:
            logger.debug("starting cookie decryption ...")

            e_cookie = b64decode(data)
            iv = e_cookie[:16]
            ct = e_cookie[16:]
            cipher = AES.new(self.key, AES.MODE_CBC, iv)
            pt = unpad(cipher.decrypt(ct), AES.block_size)

            logger.info("- Successfully decryted cookie")

            return pt

        except (ValueError, KeyError) as error:
            logger.error(error)
            raise Unauthorized() from error
