"""Broadcast Module"""

import logging
import socket
from urllib.parse import urlparse

import requests

from settings import Configurations

white_list = Configurations.BROADCAST_WHITELIST
gateway_server_host = Configurations.HOST

logger = logging.getLogger(__name__)

def publish(body: dict) -> None:
    """Publish a broadcast
    
    Keyword arguments:
    body -- content to be published
    
    return: None
    """

    with open(white_list, "r", encoding='UTF-8') as f_:
        for line in f_:
            try:

                url = urlparse(f"https://{gateway_server_host}:{line.rstrip()}").geturl()
                requests.delete(url=url, json=body, verify=False)

                logger.info("[x] Successfully broadcasted.")
            
            except Exception as error:
                logger.exception(error)