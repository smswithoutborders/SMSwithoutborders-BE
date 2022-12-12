import logging
import sys

from playhouse.migrate import MySQLMigrator
from playhouse.migrate import migrate

from peewee import CharField
from peewee import OperationalError

from src.schemas.db_connector import db
from src.schemas.wallets import Wallets

migrator = MySQLMigrator(db)

def migrate_wallets() -> None:
    """
    """
    try:
        logging.debug("Starting wallets schema migration ...")
        migrate(
            migrator.drop_constraint('wallets', 'wallets_ibfk_2'),
            migrator.drop_index('wallets', 'platformId'),
            migrator.alter_column_type('wallets', 'platformId', CharField()),
        )

        wallet_update_gmail = Wallets.update(
            platformId = "gmail"
        ).where(
            Wallets.platformId == 1
        )

        wallet_update_twitter = Wallets.update(
            platformId = "twitter"
        ).where(
            Wallets.platformId == 2
        )

        wallet_update_telegram = Wallets.update(
            platformId = "telegram"
        ).where(
            Wallets.platformId == 3
        )

        wallet_update_gmail.execute()
        wallet_update_twitter.execute()
        wallet_update_telegram.execute()

        logging.debug("- Successfully migrated wallets schema")

    except OperationalError as error:
        raise error

def migrate_usersinfo() -> None:
    """
    """
    try:
        logging.debug("Starting usersinfo schema migration ...")
        migrate(
            migrator.drop_column('usersInfos', 'phone_number'),
        )

        logging.debug("- Successfully migrated usersinfo schema")

    except OperationalError as error:
        raise error

def migrate_sessions() -> None:
    """
    """
    try:
        logging.debug("Starting session schema migration ...")
        migrate(
            migrator.alter_column_type('sessions', 'type', CharField()),
            migrator.drop_not_null('sessions', 'type'),
            migrator.drop_column('sessions', 'svid')
        )

        logging.debug("- Successfully migrated session schema")

    except OperationalError as error:
        raise error

def main() -> None:
    """
    """
    try:
        migrate_wallets()
        logging.info("- Successfully Migrated Wallets Table")

        migrate_usersinfo()
        logging.info("- Successfully Migrated UsersInfo Table")

        migrate_sessions()
        logging.info("- Successfully Migrated Sessions Table")

        sys.exit(0)
        
    except Exception as error:
        logging.error(str(error))

if __name__ == "__main__":

    logging.basicConfig(level="INFO")
    main()