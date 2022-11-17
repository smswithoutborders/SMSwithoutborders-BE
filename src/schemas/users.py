from peewee import Model, CharField, DateTimeField

from src.schemas.db_connector import db

from datetime import datetime
from uuid import uuid1

class Users(Model):
    id = CharField(primary_key=True, default=uuid1)
    password = CharField(null=True)
    current_login = DateTimeField(null=True)
    last_login = DateTimeField(null=True)
    createdAt = DateTimeField(null=True, default=datetime.now)

    class Meta:
        database = db

if db.table_exists('users') is False:
    db.create_tables([Users])