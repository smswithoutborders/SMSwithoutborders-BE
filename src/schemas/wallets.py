from peewee import Model, CharField, TextField, ForeignKeyField, DateTimeField

from src.schemas.db_connector import db

from src.schemas.users import Users

from datetime import datetime

class Wallets(Model):
    username = CharField(null=True)
    token = TextField(null=True)
    uniqueId = CharField(null=True)
    uniqueIdHash = CharField(unique=True, null=True)
    iv = CharField(null=True)
    userId = ForeignKeyField(Users, column_name="userId")
    platformId = CharField(column_name="platformId")
    createdAt = DateTimeField(null=True, default=datetime.now)

    class Meta:
        database = db
        indexes = ((('userId', 'platformId'), True),)

if db.table_exists('wallets') is False:
    db.create_tables([Wallets])