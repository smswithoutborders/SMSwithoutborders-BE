import logging
logger = logging.getLogger(__name__)

import os
import json
from error import InternalServerError
from Configs import configuration
from schemas.baseModel import db
from contextlib import closing
from mysql.connector import connect, Error

from schemas import Wallets
from schemas import Platforms
from schemas import Users

config = configuration()
database = config["DATABASE"]

def create_database():
    try:
        with closing(
            connect(
                user=database["MYSQL_USER"],
                password=database["MYSQL_PASSWORD"],
                host=database["MYSQL_HOST"],
                auth_plugin="mysql_native_password",
            )
        ) as connection:
            create_db_query = f"CREATE DATABASE IF NOT EXISTS {database['MYSQL_DATABASE']};"
            with closing(connection.cursor()) as cursor:
                logger.debug(f"Creating database {database['MYSQL_DATABASE']} ...")
                cursor.execute(create_db_query)
                logger.info(f"Database {database['MYSQL_DATABASE']} successfully created")
    except Error as error:
        raise InternalServerError(error)
    except Exception as error:
        raise InternalServerError(error)

def create_tables():
    try:
        logger.debug(f"Syncing database {database['MYSQL_DATABASE']} ...")
        db.create_tables([Wallets, Platforms, Users])

        logger.info(f"Successfully Sync database {database['MYSQL_DATABASE']}")
    except Exception as error:
        raise InternalServerError(error)

def sync_platforms():
    try:
        platform_info_filepath = os.path.abspath("platforms/info.json")

        if not os.path.exists(platform_info_filepath):
            error = f"Platforms information file not found at {platform_info_filepath}"
            raise InternalServerError(error)

        with open(platform_info_filepath) as data_file:    
            data = json.load(data_file)
            for platform in data:
                try:
                    Platforms.get(Platforms.name == platform["name"])
                except Platforms.DoesNotExist:
                    logger.debug(f"Adding platform {platform['name']} ...")
                    Platforms.create(
                        name=platform["name"],
                        logo=platform["logo"],
                        description=platform["description"],
                        protocols=platform["protocols"],
                        type=platform["type"],
                        letter=platform["letter"],
                    )
    except Exception as error:
        raise InternalServerError(error)
