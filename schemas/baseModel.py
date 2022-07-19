from Configs import configuration

from peewee import MySQLDatabase
from peewee import Model
from peewee import DatabaseError

from werkzeug.exceptions import InternalServerError

config = configuration()
database = config["DATABASE"]

try:
    db = MySQLDatabase(
        database["MYSQL_DATABASE"],
        user=database["MYSQL_USER"],
        password=database["MYSQL_PASSWORD"],
        host=database["MYSQL_HOST"],
    )

except DatabaseError as error:
    raise InternalServerError(error)

class BaseModel(Model):
    class Meta:
        database = db
