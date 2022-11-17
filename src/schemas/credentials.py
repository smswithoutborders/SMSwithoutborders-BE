from peewee import Model, TextField, DateTimeField

from src.schemas.db_connector import db

from datetime import datetime
import secrets

g_key = secrets.token_hex(nbytes=16)
g_salt = secrets.token_hex(nbytes=16)

class Credentials(Model):
    shared_key = TextField(null=False, default=g_key)
    hashing_salt = TextField(null=False, default=g_salt)
    createdAt = DateTimeField(null=True, default=datetime.now)

    class Meta:
        database = db

if db.table_exists('credentials') is False:
    db.create_tables([Credentials])