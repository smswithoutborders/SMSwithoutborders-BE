from peewee import CharField
from peewee import TextField
from peewee import ForeignKeyField
from peewee import DateTimeField

from schemas.baseModel import BaseModel

from schemas.users import Users
from schemas.platforms import Platforms

from datetime import datetime

class Wallets(BaseModel):
    username = CharField(null=True)
    token = TextField(null=True)
    uniqueId = CharField(null=True)
    uniqueIdHash = CharField(unique=True, null=True)
    iv = CharField(null=True)
    userId = ForeignKeyField(Users, column_name="userId")
    platformId = ForeignKeyField(Platforms, column_name="platformId")
    createdAt = DateTimeField(null=True, default=datetime.now)

    class Meta:
        indexes = ((('userId', 'platformId'), True),)