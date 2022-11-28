from peewee import MySQLDatabase
from peewee import DatabaseError

from configurationHelper import DatabaseExists, CreateDatabase

from settings import Configurations
db_name = Configurations.MYSQL_DATABASE
db_host = Configurations.MYSQL_HOST
db_password = Configurations.MYSQL_PASSWORD
db_user = Configurations.MYSQL_USER

def create_database_if_not_exits(user: str, password: str, database: str, host: str) -> None:
    """
    """
    try:
        if DatabaseExists(user=user, password=password, database=database, host=host):
            pass
        else:
            CreateDatabase(
                user=user,
                password=password,
                database=database,
                host=host
            )

    except Exception as error:
        raise error

try:
    create_database_if_not_exits(
        database=db_name,
        host=db_host,
        password=db_password,
        user=db_user
    )

    db = MySQLDatabase(
        db_name,
        user=db_user,
        password=db_password,
        host=db_host,
    )

except DatabaseError as error:
    raise error