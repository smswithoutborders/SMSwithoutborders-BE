import logging
import argparse
import sys
import os

from contextlib import closing
from mysql.connector import connect

def dummy_data(user: str, password:str, host: str, path_to_dump: str) -> None:
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
            with open(path_to_dump, 'r') as f:
                with closing(connection.cursor()) as cursor:
                    cursor.execute(f.read(), multi=True)

    except Exception as error:
        raise error

def main():
    """
    """
    from Configs import baseConfig
    config = baseConfig()
    db = config["DATABASE"]

    parser = argparse.ArgumentParser()
    parser.add_argument("--user", help="Inject dummy user", action="store_true")
    args = parser.parse_args()

    try:
        if args.user:
            path_to_dump = os.path.join(os.path.dirname(__file__), 'utils/.db', 'inject_user_dump.sql')

            dummy_data(
                user=db["MYSQL_USER"],
                password=db["MYSQL_PASSWORD"],
                host=db["MYSQL_HOST"],
                path_to_dump=path_to_dump
            )

            sys.exit(0)

    except Exception as error:
        logging.error(str(error))
        sys.exit(1)

if __name__ == "__main__":

    logging.basicConfig(level="INFO")
    main()
