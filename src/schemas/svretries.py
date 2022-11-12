from peewee import Model, CharField, DateTimeField, IntegerField

from src.schemas.db_connector import db

from datetime import datetime

class Svretries(Model):
    userId = CharField(null=True, column_name="userId")
    uniqueId = CharField(null=True, column_name="uniqueId")
    count = IntegerField(null=True)
    expires = DateTimeField(null=True)
    createdAt = DateTimeField(null=True, default=datetime.now)

    class Meta:
        database = db

if db.table_exists('svretries') is False:
    db.create_tables([Svretries])