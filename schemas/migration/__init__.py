import logging
logger = logging.getLogger(__name__)

from playhouse.migrate import MySQLMigrator
from playhouse.migrate import migrate

from peewee import CharField
from peewee import OperationalError

from schemas.baseModel import db
from schemas.platforms import Platforms

migrator = MySQLMigrator(db)

def migrate_platforms() -> None:
    """
    """
    try:
        logger.debug("Starting platforms schema migration ...")
        migrate(
            migrator.drop_column('platforms', 'description'),
            migrator.add_column('platforms', 'description', Platforms.description),
        )

        logger.debug("- Successfully migrated platforms schema")

    except OperationalError as error:
        logger.debug(error)

def migrate_usersinfo() -> None:
    """
    """
    try:
        logger.debug("Starting usersinfo schema migration ...")
        migrate(
            migrator.drop_column('usersInfos', 'phone_number'),
        )

        logger.debug("- Successfully migrated usersinfo schema")

    except OperationalError as error:
        logger.debug(error)

def migrate_sessions() -> None:
    """
    """
    try:
        logger.debug("Starting session schema migration ...")
        migrate(
            migrator.alter_column_type('sessions', 'type', CharField()),
            migrator.drop_not_null('sessions', 'type')
        )

        logger.debug("- Successfully migrated session schema")

    except OperationalError as error:
        logger.debug(error)