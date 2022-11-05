from peewee import TextField
from peewee import DateTimeField

from src.schemas.baseModel import BaseModel

from datetime import datetime
import secrets

g_key = secrets.token_hex(nbytes=16)
g_salt = secrets.token_hex(nbytes=16)

class Credentials(BaseModel):
    shared_key = TextField(null=False, default=g_key)
    hashing_salt = TextField(null=False, default=g_salt)
    createdAt = DateTimeField(null=True, default=datetime.now)