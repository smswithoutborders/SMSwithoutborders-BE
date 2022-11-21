import logging
logger = logging.getLogger(__name__)

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

try:
    try:
        Credentials.get(Credentials.id == 1)
    except Credentials.DoesNotExist:
        logger.debug("Adding initials credentials ...")

        Credentials.create()

except Exception as error:
    raise error