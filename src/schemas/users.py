from peewee import CharField
from peewee import DateTimeField

from src.schemas.baseModel import BaseModel

from datetime import datetime
from uuid import uuid1

class Users(BaseModel):
    id = CharField(primary_key=True, default=uuid1)
    password = CharField(null=True)
    current_login = DateTimeField(null=True)
    last_login = DateTimeField(null=True)
    createdAt = DateTimeField(null=True, default=datetime.now)