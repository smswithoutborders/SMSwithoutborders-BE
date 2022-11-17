import logging

from Configs import baseConfig
config = baseConfig()
platforms_path = config["PLATFORMS_PATH"]

import os
import json

from configurationHelper import DatabaseExists, CreateDatabase
from utils.platformHelper import check_format

from contextlib import closing
from mysql.connector import connect

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

def dummy_data(user: str, password:str, host: str) -> None:
    """
    """
    try:
        with closing(
            connect(
                user=user,
                password=password,
                host=host,
                auth_plugin="mysql_native_password",
            )
        ) as connection:
            path_to_dump = os.path.join(os.path.dirname(__file__), '.db', 'inject_user_dump.sql')
            with open(path_to_dump, 'r') as f:
                with closing(connection.cursor()) as cursor:
                    cursor.execute(f.read(), multi=True)

    except Exception as error:
        raise error

def sync_platforms(Platforms: object) -> None:
    """
    """
    try:
        if platforms_path:
            available_platforms = [ f.path for f in os.scandir(platforms_path) if f.is_dir() ]
        else:
            available_platforms = []

        for Platform in available_platforms:
            platform_path = os.path.join(platforms_path, Platform)

            if not check_format(search_path=platform_path):
                continue
          
            platform_info_filepath = os.path.join(platform_path, "info.json")
            with open(platform_info_filepath, encoding="utf-8") as data_file:    
                data = json.load(data_file)

            try:
                Platforms.get(Platforms.name == data.get("name"))
            except Platforms.DoesNotExist:
                logger.debug("Adding platform %s ..." % data.get("name"))

                Platforms.create(
                    name=data.get("name"),
                    logo=data.get("logo"),
                    description=json.dumps(data.get("description")),
                    protocols=json.dumps(data.get("protocols")),
                    type=data.get("type"),
                    letter=data.get("letter"),
                )
            else:
                upd_plarforms = Platforms.update(
                    logo=data.get("logo"),
                    description=json.dumps(data.get("description")),
                    protocols=json.dumps(data.get("protocols")),
                    type=data.get("type"),
                    letter=data.get("letter"),
                ).where(
                    Platforms.name == data.get("name")
                )

                upd_plarforms.execute()

    except Exception as error:
        raise error

def sync_credentials(Credentials: object) -> None:
    """
    """
    try:
        try:
            Credentials.get(Credentials.id == 1)
        except Credentials.DoesNotExist:
            logger.debug("Adding initials credentials ...")

            Credentials.create()

    except Exception as error:
        raise error