"""Broadcast Module"""

import logging
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

    with open(white_list, "r", encoding='UTF-8') as f_:
        for line in f_:
            try:

                url = urlparse(line.rstrip()).geturl()
                requests.delete(url=url, json=body)

                logger.info(["[x] Successfully broadcasted."])
            
            except Exception as error:
                logger.exception(error)