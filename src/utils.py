"""Utitlies Module."""

import logging
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
