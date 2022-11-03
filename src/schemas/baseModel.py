from Configs import baseConfig

from peewee import MySQLDatabase
from peewee import Model
from peewee import DatabaseError

config = baseConfig()
database = config["DATABASE"]

try:
    db = MySQLDatabase(
        database["MYSQL_DATABASE"],
        user=database["MYSQL_USER"],
        password=database["MYSQL_PASSWORD"],
        host=database["MYSQL_HOST"],
    )

except DatabaseError as error:
    raise error

class BaseModel(Model):
    class Meta:
        database = db
