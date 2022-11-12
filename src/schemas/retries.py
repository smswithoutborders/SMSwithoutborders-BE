from peewee import Model, CharField, DateTimeField, IntegerField

from src.schemas.db_connector import db

from datetime import datetime

class Retries(Model):
    uniqueId = CharField(null=True, column_name="uniqueId")
    count = IntegerField(null=True)
    block = IntegerField(null=True)
    expires = DateTimeField(null=True)
    createdAt = DateTimeField(null=True, default=datetime.now)

    class Meta:
        database = db

if db.table_exists('retries') is False:
    db.create_tables([Retries])