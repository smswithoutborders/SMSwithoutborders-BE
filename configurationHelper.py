#!/usr/bin/env python 

from datetime import datetime
import argparse
from getpass import getpass
import sys
import logging

from contextlib import closing
from mysql.connector import connect

def DatabaseExists(user: str, password: str, database: str, host: str) -> None:
    """
    """
    try:
        with closing(
            connect(
                user=user,
                password=password,
                host=host,
                database=database,
                auth_plugin="mysql_native_password",
                charset="utf8mb4",
                collation="utf8mb4_unicode_ci",
            )
        ) as connection:
            test_db_query = "SELECT 1+1"

            with closing(connection.cursor()) as cursor:
                cursor.execute(test_db_query)
                cursor.fetchall()

                return True

    except Exception as error:
        if str(error) == "1049 (42000): Unknown database '%s'" % database:
            return False
        else:
            raise error

def CreateDatabase(user: str, password: str, database: str, host: str) -> None:
    """
    """
    try:
        with closing(
            connect(
                user=user,
                password=password,
                host=host,
                auth_plugin="mysql_native_password",
                charset="utf8mb4",
                collation="utf8mb4_unicode_ci",
            )
        ) as connection:
            create_db_query = "CREATE DATABASE IF NOT EXISTS %s;" % database

            with closing(connection.cursor()) as cursor:
                cursor.execute(create_db_query)

    except Exception as error:
        raise error

def CreateCredentialsTable(user: str, password: str, database: str, host: str) -> None:
    """
    """
    with closing(
        connect(
            user=user,
            password=password,
            database=database,
            host=host,
            auth_plugin="mysql_native_password",
            charset="utf8mb4",
            collation="utf8mb4_unicode_ci",
        )
    ) as connection:
        create_table_query = """CREATE TABLE IF NOT EXISTS `credentials` (`id` int NOT NULL AUTO_INCREMENT, `shared_key` text NOT NULL, `hashing_salt` text NOT NULL, `createdAt` datetime DEFAULT NULL, PRIMARY KEY (`id`)) ;"""
      
        with closing(connection.cursor()) as cursor:
            cursor.execute(create_table_query)

            return None

def SetKeys(user: str, password: str, database: str, host: str, key: str, salt: str) -> None:
    """
    """
    with closing(
        connect(
            user=user,
            password=password,
            database=database,
            host=host,
            auth_plugin="mysql_native_password",
            charset="utf8mb4",
            collation="utf8mb4_unicode_ci",
        )
    ) as connection:
        set_keys_query = """INSERT INTO credentials(id, shared_key, hashing_salt, createdAt) VALUES(%s, %s, %s, %s) ON DUPLICATE KEY UPDATE shared_key=%s, hashing_salt=%s, createdAt=%s;"""
      
        with closing(connection.cursor()) as cursor:
            cursor.execute(set_keys_query, (1, key, salt, datetime.now(), key, salt, datetime.now(),))
            connection.commit()

            return None
            
def GetKeys(user: str, password: str, database: str, host: str) -> None:
    """
    """
    with closing(
        connect(
            user=user,
            password=password,
            database=database,
            host=host,
            auth_plugin="mysql_native_password",
            charset="utf8mb4",
            collation="utf8mb4_unicode_ci",
        )
    ) as connection:
        get_keys_query = """SELECT shared_key, hashing_salt FROM credentials WHERE id = %s;"""
      
        with closing(connection.cursor(dictionary=True)) as cursor:
            cursor.execute(get_keys_query, (1,))
            result = cursor.fetchall()

            if len(result) < 1:
                return {
                    "shared_key": "",
                    "hashing_salt": ""
                }
            else:
                return result[0]

def main():
    """
    """
    from settings import Configurations

    db_name = Configurations.MYSQL_DATABASE
    db_host = Configurations.MYSQL_HOST
    db_user = Configurations.MYSQL_USER

    parser = argparse.ArgumentParser()
    parser.add_argument("--setkeys", help="Set shared-key and hashing-salt values", action="store_true")
    parser.add_argument("--getkeys", help="Get shared-key and hashing-salt values", action="store_true")
    args = parser.parse_args()

    try:
        host = input("Host [default = '%s']: " % db_host) or db_host
        user = input("Username [default = '%s']: " % db_user) or db_user
        database = input("Database [default = '%s']: " % db_name) or db_name
        password = getpass()

        if DatabaseExists(user=user, password=password, database=database, host=host):
            pass
        else:
            decision = input("[!] Unknown database '%s'. Do you want to create database '%s'? [Y/n]: " % (database, database)) or "Y"

            if str(decision) in ["Y", "y"]:
                CreateDatabase(
                    user=user,
                    password=password,
                    database=database,
                    host=host
                )

            elif str(decision) in ["N", "n"]:
                print("Ok, Bye!")
                sys.exit(0)
            
            else:
                print("Unknown decision '%s'" % decision)
                sys.exit(1)

        CreateCredentialsTable(
            user=user,
            password=password,
            database=database,
            host=host
        )

        if args.setkeys:
            keyPairs = GetKeys(
                user=user,
                password=password,
                database=database,
                host=host
            )
            
            key = input("Shared Key [default = '%s']:" % keyPairs["shared_key"]) or keyPairs["shared_key"]
            salt = input("Hashing Salt [default = '%s']:" % keyPairs["hashing_salt"]) or keyPairs["hashing_salt"]

            SetKeys(
                user=user,
                password=password,
                database=database,
                host=host,
                salt=salt,
                key=key
            )

            sys.exit(0)

        elif args.getkeys:
            keyPairs = GetKeys(
                user=user,
                password=password,
                database=database,
                host=host
            )

            print(keyPairs)
            sys.exit(0)

    except Exception as error:
        logging.error(str(error))
        sys.exit(1)

if __name__ == "__main__":

    logging.basicConfig(level="INFO")
    main()
