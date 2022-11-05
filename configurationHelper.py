#!/usr/bin/env python 

from datetime import datetime
import argparse
from getpass import getpass
import sys
import logging

from contextlib import closing
from mysql.connector import connect

def SetKeys(user: str, password: str, database: str, key: str, salt: str) -> None:
    """
    """
    with closing(
        connect(
            user=user,
            password=password,
            database=database
        )
    ) as connection:
        set_keys_query = """INSERT INTO credentials(id, shared_key, hashing_salt, createdAt) VALUES(%s, %s, %s, %s) ON DUPLICATE KEY UPDATE shared_key=%s, hashing_salt=%s, createdAt=%s;"""
      
        with closing(connection.cursor()) as cursor:
            cursor.execute(set_keys_query, (1, key, salt, datetime.now(), key, salt, datetime.now(),))
            connection.commit()

            return None
            
def GetKeys(user: str, password: str, database: str) -> None:
    """
    """
    with closing(
        connect(
            user=user,
            password=password,
            database=database
        )
    ) as connection:
        get_keys_query = """SELECT shared_key, hashing_salt FROM credentials WHERE id = %s;"""
      
        with closing(connection.cursor(dictionary=True)) as cursor:
            cursor.execute(get_keys_query, (1,))
            result = cursor.fetchall()

            return result[0]

def main():
    """
    """
    from Configs import baseConfig
    config = baseConfig()
    db = config["DATABASE"]

    parser = argparse.ArgumentParser()
    parser.add_argument("--setkeys", help="Set shared-key and hashing-salt values", action="store_true")
    parser.add_argument("--getkeys", help="Get shared-key and hashing-salt values", action="store_true")
    args = parser.parse_args()

    try:
        if args.setkeys:
            user = input("Username [default = %s]:" % db["MYSQL_USER"]) or db["MYSQL_USER"]
            password = getpass() or db["MYSQL_PASSWORD"]
            database = input("Database [default = %s]:" % db["MYSQL_DATABASE"]) or db["MYSQL_DATABASE"]

            keyPairs = GetKeys(
                user=user,
                password=password,
                database=database
            )
            
            key = input("Shared Key [default = %s]:" % keyPairs["shared_key"]) or keyPairs["shared_key"]
            salt = input("Hashing Salt [default = %s]:" % keyPairs["hashing_salt"]) or keyPairs["hashing_salt"]

            SetKeys(
                user=user,
                password=password,
                database=database,
                salt=salt,
                key=key
            )

            sys.exit(0)

        elif args.getkeys:
            user = input("Username [default = %s]:" % db["MYSQL_USER"]) or db["MYSQL_USER"]
            password = getpass() or db["MYSQL_PASSWORD"]
            database = input("Database [default = %s]:" % db["MYSQL_DATABASE"]) or db["MYSQL_DATABASE"]

            keyPairs = GetKeys(
                user=user,
                password=password,
                database=database
            )

            print(keyPairs)
            sys.exit(0)

    except Exception as error:
        logging.error(str(error))
        sys.exit(1)

if __name__ == "__main__":

    logging.basicConfig(level="INFO")
    main()
