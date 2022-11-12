import logging

from Configs import baseConfig
config = baseConfig()
platforms_path = config["PLATFORMS_PATH"]

import os
import json

from configurationHelper import DatabaseExists, CreateDatabase

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

def sync_platforms(Platforms: object) -> None:
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