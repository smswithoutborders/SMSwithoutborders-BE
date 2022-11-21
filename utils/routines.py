import logging

from Configs import baseConfig
config = baseConfig()
platforms_path = config["PLATFORMS_PATH"]

import os
import json

from configurationHelper import DatabaseExists, CreateDatabase
from utils.platformHelper import check_format

logger = logging.getLogger(__name__)

def create_database_if_not_exits(user: str, password: str, database: str, host: str) -> None:
    """
    """
    try:
        if DatabaseExists(user=user, password=password, database=database, host=host):
            pass
        else:
            CreateDatabase(
                user=user,
                password=password,
                database=database,
                host=host
            )

    except Exception as error:
        raise error