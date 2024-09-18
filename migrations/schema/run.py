"""
Database migration tool using peewee ORM.

Applies schema changes defined in JSON spec file.
"""

import os
import json
import argparse
import logging
from typing import List, Dict

import peewee
from playhouse.migrate import MySQLMigrator, migrate

from src.db import connect

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("[SCHEMA MIGRATOR]")

MIGRATION_DIR = os.path.join("migrations", "schema")
ALLOWED_FIELDS = ("CharField",)
PENDING = "⏳"
SUCCESS = "✅"
FAILED = "❌"

db = connect()
migrator = MySQLMigrator(db)

ACTIONS = {
    "add_column": migrator.add_column,
    "drop_column": migrator.drop_column,
    "rename_column": migrator.rename_column,
    "add_not_null": migrator.add_not_null,
    "drop_not_null": migrator.drop_not_null,
    "rename_table": migrator.rename_table,
    "add_index": migrator.add_index,
    "drop_index": migrator.drop_index,
}


def parse_field(field_str: str) -> peewee.Field:
    """
    Parse a field string from spec into a Field instance.

    Args:
        field_str (str): String representation of a field (e.g., "CharField(max_length=255)").

    Returns:
        peewee.Field: Corresponding peewee Field instance.

    Raises:
        ValueError: If field type is not allowed.
    """
    field_type = field_str.split("(")[0]
    if field_type not in ALLOWED_FIELDS:
        raise ValueError(f"Unsupported field: {field_type}")
    return eval("peewee." + field_str)


def migrate_operations(operations: List[Dict]):
    """
    Execute migration operations.

    Args:
        operations (list): List of migration actions to execute.

    Raises:
        ValueError: If unsupported actions or fields are encountered.
    """
    migrations_done, migrations_failed = 0, 0

    for operation in operations:
        logger.info("Performing operation: %s", operation)
        print(f"Performing operation: {operation} {PENDING}", end="\r")

        try:
            action = operation.pop("action")

            if "field" in operation:
                operation["field"] = parse_field(operation["field"])

            if action not in ACTIONS:
                raise ValueError(f"Unsupported action: {action}")

            migrate(ACTIONS[action](**operation))
            migrations_done += 1
            print(f"{SUCCESS} Operation successful: {operation}")
        except Exception as e:
            migrations_failed += 1
            print(f"{FAILED} Operation failed: {operation}\nError: {e}")

    logger.info("%s Completed migrations: %d", SUCCESS, migrations_done)
    logger.info("%s Failed migrations: %d", FAILED, migrations_failed)


def check_and_migrate_schema(current_schema_version: str):
    """
    Check the current schema version and run migrations if necessary.

    Args:
        current_schema_version (str): Current version of the schema in the database.
    """
    latest_schema_version = get_latest_schema_version()

    if latest_schema_version and current_schema_version != latest_schema_version:
        logger.info(
            "Migration required. Migrating from version %s to version %s",
            current_schema_version,
            latest_schema_version,
        )
        spec = load_spec(latest_schema_version)
        migrate_operations(spec)
        logger.info("Migration to version %s completed.", latest_schema_version)
    else:
        logger.info("Database schema is up to date.")


def get_latest_schema_version() -> str:
    """
    Retrieve the latest schema version from the migration directory.

    Returns:
        str: Latest schema version, or None if no migrations found.
    """
    if not os.path.isdir(MIGRATION_DIR):
        logger.warning("Migration directory not found: %s", MIGRATION_DIR)
        return None

    migration_files = sorted(
        [
            file
            for file in os.listdir(MIGRATION_DIR)
            if file.startswith("v") and file.endswith(".json")
        ],
        reverse=True,
    )

    return migration_files[0].rstrip(".json") if migration_files else None


def load_spec(spec_version: str) -> List[Dict]:
    """
    Load the migration specification file for the given version.

    Args:
        spec_version (str): The version of the spec to load (e.g., "v1.0").

    Returns:
        List[Dict]: Parsed migration operations.

    Raises:
        FileNotFoundError: If the spec file is not found.
    """
    spec_file_path = os.path.join(MIGRATION_DIR, f"{spec_version}.json")

    if not os.path.exists(spec_file_path):
        raise FileNotFoundError(f"Spec file '{spec_file_path}' not found.")

    with open(spec_file_path, encoding="utf-8") as f:
        return json.load(f)


def run():
    """
    Main function to parse command-line arguments and initiate migration.
    """
    parser = argparse.ArgumentParser(
        description="Apply database migrations using a specified schema version."
    )
    parser.add_argument(
        "command",
        choices=["migrate", "rollback"],
        help="Command to execute (e.g., 'migrate' or 'rollback').",
    )
    parser.add_argument("spec_version", help="Schema version to apply (e.g., 'v1.0').")
    args = parser.parse_args()

    match args.command:
        case "migrate":
            spec = load_spec(args.spec_version)
            migrate_operations(spec)
        case "rollback":
            logger.info("Rollback feature is not implemented yet.")


if __name__ == "__main__":
    run()
