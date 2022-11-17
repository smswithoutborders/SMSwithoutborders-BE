from Configs import baseConfig

from peewee import MySQLDatabase
from peewee import DatabaseError

from utils.routines import create_database_if_not_exits

config = baseConfig()
database = config["DATABASE"]

db_name = database["MYSQL_DATABASE"]
db_host = database["MYSQL_HOST"]
db_password = database["MYSQL_PASSWORD"]
db_user = database["MYSQL_USER"]

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