import logging
import sys

from playhouse.migrate import MySQLMigrator
from playhouse.migrate import migrate

from peewee import CharField
from peewee import OperationalError

from schemas.db_connector import db
from src.schemas.platforms import Platforms

migrator = MySQLMigrator(db)

logger = logging.getLogger(__name__)

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

def main() -> None:
    """
    """
    try:
        migrate_platforms()
        logger.info("- Successfully Migrated Platforms Table")

        migrate_usersinfo()
        logger.info("- Successfully Migrated UsersInfo Table")

        migrate_sessions()
        logger.info("- Successfully Migrated Sessions Table")

        sys.exit(0)
        
    except Exception as error:
        logger.error(str(error))
        sys.exit(1)

if __name__ == "__main__":

    logging.basicConfig(level="INFO")
    main()