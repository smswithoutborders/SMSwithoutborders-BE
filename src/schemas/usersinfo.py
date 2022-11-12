from peewee import Model, CharField, DateTimeField, ForeignKeyField

from src.schemas.db_connector import db
from src.schemas.users import Users

from datetime import datetime

class UsersInfos(Model):
    name = CharField(null=True)
    country_code = CharField(null=True)
    full_phone_number = CharField(null=True)
    status = CharField(default="unverified")
    userId = ForeignKeyField(Users, column_name="userId")
    iv = CharField(null=True)
    createdAt = DateTimeField(null=True, default=datetime.now)

    class Meta:
        database = db
        table_name = 'usersInfos'

if db.table_exists('usersInfos') is False:
    db.create_tables([UsersInfos])