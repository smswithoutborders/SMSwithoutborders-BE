import logging
logger = logging.getLogger(__name__)

from Configs import baseConfig
config = baseConfig()
database = config["DATABASE"]
platforms_path = config["PLATFORMS_PATH"]

import os
import json

from schemas.baseModel import db
from contextlib import closing
from mysql.connector import connect
from mysql.connector import Error

from schemas.wallets import Wallets
from schemas.platforms import Platforms
from schemas.users import Users
from schemas.sessions import Sessions
from schemas.usersinfo import UsersInfos
from schemas.svretries import Svretries

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
            Svretries
        ])

        logger.info("- Successfully Sync database %s" % database['MYSQL_DATABASE'])

    except Exception as error:
        raise error

def sync_platforms() -> None:
    """
    """
    try:
        platform_info_filepath = os.path.join(platforms_path, "info.json")

        if not os.path.exists(platform_info_filepath):
            error = "Platforms information file not found at %s" % platform_info_filepath
            raise FileNotFoundError(error)

        with open(platform_info_filepath) as data_file:    
            data = json.load(data_file)
            for platform in data:
                try:
                    Platforms.get(Platforms.name == platform["name"])
                except Platforms.DoesNotExist:
                    logger.debug("Adding platform %s ..." % platform['name'])

                    Platforms.create(
                        name=platform["name"],
                        logo=platform["logo"],
                        description=json.dumps(platform["descriptions"]),
                        protocols=platform["protocol"],
                        type=platform["type"],
                        letter=platform["letter"],
                    )
                else:
                    upd_plarforms = Platforms.update(
                        logo=platform["logo"],
                        description=json.dumps(platform["descriptions"]),
                        protocols=platform["protocol"],
                        type=platform["type"],
                        letter=platform["letter"],
                    ).where(
                        Platforms.name == platform['name']
                    )

                    upd_plarforms.execute()

    except Exception as error:
        raise error
