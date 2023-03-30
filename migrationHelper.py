import logging
import sys

from playhouse.migrate import MySQLMigrator
from playhouse.migrate import migrate

from peewee import OperationalError

from src.schemas.db_connector import db
from src.schemas.wallets import Wallets
from src.schemas.usersinfo import UsersInfos

migrator = MySQLMigrator(db)


def migrate_wallets() -> None:
    """ """
    try:
        logging.debug("Starting wallets schema migration ...")

        wallets = Wallets.select()

        for wallet in wallets.iterator():
            wallet.username = (wallet.iv or "") + wallet.username if wallet.username else None
            wallet.token = (wallet.iv or "") + wallet.token if wallet.token else None
            wallet.uniqueId = (wallet.iv or "") + wallet.uniqueId if wallet.uniqueId else None

            wallet.save()

        logging.debug("- Successfully migrated wallets schema")

    except OperationalError as error:
        raise error


def migrate_usersinfo() -> None:
    """ """
    try:
        logging.debug("Starting usersinfo schema migration ...")

        user_infos = UsersInfos.select()

        for user_info in user_infos.iterator():
            user_info.name = (user_info.iv or "") + user_info.name if user_info.name else None
            user_info.country_code = (user_info.iv or "") + user_info.country_code if user_info.country_code else None

            user_info.save()

        logging.debug("- Successfully migrated usersinfo schema")

    except OperationalError as error:
        raise error


def main() -> None:
    """ """
    try:
        migrate_wallets()
        logging.info("- Successfully Migrated Wallets Table")

        migrate_usersinfo()
        logging.info("- Successfully Migrated UsersInfo Table")

        sys.exit(0)

    except Exception as error:
        logging.error(str(error))


if __name__ == "__main__":

    logging.basicConfig(level="INFO")
    main()
