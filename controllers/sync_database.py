import logging
logger = logging.getLogger(__name__)

from Configs import baseConfig
config = baseConfig()
database = config["DATABASE"]
platforms_path = config["PLATFORMS_PATH"]

import os
import json

from src.schemas.baseModel import db
from contextlib import closing
from mysql.connector import connect
from mysql.connector import Error

from src.schemas.wallets import Wallets
from src.schemas.platforms import Platforms
from src.schemas.users import Users
from src.schemas.sessions import Sessions
from src.schemas.usersinfo import UsersInfos
from src.schemas.svretries import Svretries
from src.schemas.retries import Retries
from src.schemas.credentials import Credentials

def create_database() -> None:
    """
    """
    try:
        with closing(
            connect(
                user=database["MYSQL_USER"],
                password=database["MYSQL_PASSWORD"],
                host=database["MYSQL_HOST"],
                auth_plugin="mysql_native_password",
            )
        ) as connection:
            create_db_query = "CREATE DATABASE IF NOT EXISTS %s;" % database['MYSQL_DATABASE']

            with closing(connection.cursor()) as cursor:
                logger.debug("Creating database %s ..." % database['MYSQL_DATABASE'])

                cursor.execute(create_db_query)

                logger.info("- Database %s successfully created" % database['MYSQL_DATABASE'])

    except Error as error:
        raise error

    except Exception as error:
        raise error

def create_tables() -> None:
    """
    """
    try:
        logger.debug("Syncing database %s ..." % database['MYSQL_DATABASE'])

        db.create_tables([
            Wallets,
            Platforms,
            Users,
            UsersInfos,
            Sessions,
            Svretries,
            Retries,
            Credentials
        ])

        logger.info("- Successfully Sync database %s" % database['MYSQL_DATABASE'])

    except Exception as error:
        raise error

def sync_platforms() -> None:
    """
    """
    try:
        available_platforms = [ f.path for f in os.scandir(platforms_path) if f.is_dir() ]

        for Platform in available_platforms:
            platform_info_filepath = os.path.join(platforms_path, Platform, "info.json")

            if not os.path.exists(platform_info_filepath):
                error = "Missing platform information file at %s" % os.path.join(platforms_path, Platform)
                logger.error(error)
                continue

            with open(platform_info_filepath, encoding="utf-8") as data_file:    
                data = json.load(data_file)

            for platform in data:
                try:
                    Platforms.get(Platforms.name == platform["name"])
                except Platforms.DoesNotExist:
                    logger.debug("Adding platform %s ..." % platform['name'])

                    Platforms.create(
                        name=platform["name"],
                        logo=platform["logo"],
                        description=json.dumps(platform["description"]),
                        protocols=json.dumps(platform["protocols"]),
                        type=platform["type"],
                        letter=platform["letter"],
                    )
                else:
                    upd_plarforms = Platforms.update(
                        logo=platform["logo"],
                        description=json.dumps(platform["description"]),
                        protocols=json.dumps(platform["protocols"]),
                        type=platform["type"],
                        letter=platform["letter"],
                    ).where(
                        Platforms.name == platform['name']
                    )

                    upd_plarforms.execute()

    except Exception as error:
        raise error

def sync_credentials() -> None:
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