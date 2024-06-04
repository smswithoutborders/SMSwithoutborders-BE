"""Utitlies Module."""

import os
import logging
from functools import wraps

import mysql.connector
from peewee import DatabaseError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_key(filepath, key_length):
    """
    Load a key from a file.

    This function reads the first line from the specified
    file and returns the specified number of characters
    from that line, encoded as bytes.

    Args:
        filepath (str): The path to the file containing the key.
        key_length (int): The number of characters to load from the first line.

    Returns:
        bytes: The specified number of characters from the first line in the file
            encoded as bytes.

    Raises:
        FileNotFoundError: If the file does not exist at the specified filepath.
        Exception: If an unexpected error occurs during file reading.
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            key = f.readline().strip()[:key_length]
            return key.encode("utf-8")
    except FileNotFoundError:
        logger.error(
            "Key file not found at %s. Please check the configuration.",
            filepath,
        )
        raise
    except Exception as e:
        logger.critical("An unexpected error occurred while loading the key: %s", e)
        raise


def create_tables(models):
    """
    Creates tables for the given models if they don't
        exist in their specified database.

    Args:
        models(list): A list of Peewee Model classes.
    """
    if not models:
        logger.warning("No models provided for table creation.")
        return

    try:
        databases = {}
        for model in models:
            database = model._meta.database
            if database not in databases:
                databases[database] = []
            databases[database].append(model)

        for database, db_models in databases.items():
            with database.atomic():
                existing_tables = set(database.get_tables())
                tables_to_create = [
                    model
                    for model in db_models
                    if model._meta.table_name not in existing_tables
                ]

                if tables_to_create:
                    database.create_tables(tables_to_create)
                    logger.info(
                        "Created tables: %s",
                        [model._meta.table_name for model in tables_to_create],
                    )
                else:
                    logger.debug("No new tables to create.")

    except DatabaseError as e:
        logger.error("An error occurred while creating tables: %s", e)


def ensure_database_exists(host, user, password, database_name):
    """
    Decorator that ensures a MySQL database exists before executing a function.

    Args:
        host (str): The host address of the MySQL server.
        user (str): The username for connecting to the MySQL server.
        password (str): The password for connecting to the MySQL server.
        database_name (str): The name of the database to ensure existence.

    Returns:
        function: Decorated function.
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                with mysql.connector.connect(
                    host=host, user=user, password=password
                ) as connection:
                    with connection.cursor() as cursor:
                        sql = "CREATE DATABASE IF NOT EXISTS " + database_name
                        cursor.execute(sql)

            except mysql.connector.Error as error:
                logger.error("Failed to create database: %s", error)

            return func(*args, **kwargs)

        return wrapper

    return decorator


def get_configs(config_name: str, strict: bool = False) -> str:
    """
    Retrieves the value of a configuration from the environment variables.

    Args:
        config_name (str): The name of the configuration to retrieve.
        strict (bool): If True, raises an error if the configuration is not found. Default is False.

    Returns:
        str: The value of the configuration, or None if not found and strict is False.

    Raises:
        KeyError: If the configuration is not found and strict is True.
        ValueError: If the configuration value is empty and strict is True.
    """
    try:
        value = os.environ[config_name] if strict else os.environ.get(config_name)
        if strict and (value is None or value.strip() == ""):
            raise ValueError(f"Configuration '{config_name}' is missing or empty.")
        return value
    except KeyError as error:
        logger.error(
            "Configuration '%s' not found in environment variables: %s",
            config_name,
            error,
        )
        raise
    except ValueError as error:
        logger.error("Configuration '%s' is empty: %s", config_name, error)
        raise


def set_configs(config_name: str, config_value: str) -> None:
    """
    Sets the value of a configuration in the environment variables.

    Args:
        config_name (str): The name of the configuration to set.
        config_value (str): The value of the configuration to set.

    Raises:
        ValueError: If config_name or config_value is empty.
    """
    if not config_name or not config_value:
        error_message = (
            f"Cannot set configuration. Invalid config_name '{config_name}' ",
            "or config_value '{config_value}'.",
        )
        logger.error(error_message)
        raise ValueError(error_message)

    try:
        os.environ[config_name] = config_value
    except Exception as error:
        logger.error("Failed to set configuration '%s': %s", config_name, error)
        raise
