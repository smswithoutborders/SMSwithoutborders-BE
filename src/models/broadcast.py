"""Broadcast Module"""

import logging
import socket
from urllib.parse import urlparse

import requests

from settings import Configurations

white_list = Configurations.BROADCAST_WHITELIST

logger = logging.getLogger(__name__)

def publish(body: dict) -> None:
    """Publish a broadcast
    
    Keyword arguments:
    body -- content to be published
    
    return: None
    """

    with open(white_list, "r", encoding='UTF-8') as file_:
        for line in file_:
            if line:
                try:

                    url = urlparse(line.rstrip()).geturl()
                    res = requests.delete(url=url, json=body, timeout=30)

                    logger.debug("[*] Broadcast Response:")
                    logger.debug(res.content)

                    logger.info("[x] Successfully broadcasted.")

                except Exception as error:
                    logger.exception(error)
