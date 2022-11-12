from peewee import Model, CharField, TextField, DateTimeField

from src.schemas.db_connector import db

from datetime import datetime

class Platforms(Model):
    name = CharField(unique=True, null=False)
    description = TextField(null=True)
    logo = CharField(null=True)
    protocols = CharField(null=True)
    type = CharField(null=True)
    letter = CharField(null=True)
    createdAt = DateTimeField(null=True, default=datetime.now)

    class Meta:
        database = db

if db.table_exists('platforms') is False:
    db.create_tables([Platforms])