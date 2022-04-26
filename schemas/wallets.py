import peewee as pw
from schemas.baseModel import BaseModel
from schemas.users import Users
from schemas.platforms import Platforms
from datetime import datetime

class Wallets(BaseModel):
    username = pw.CharField(null=True)
    token = pw.TextField(null=True)
    uniqueId = pw.CharField(null=True)
    uniqueIdHash = pw.CharField(unique=True, null=True)
    iv = pw.CharField(null=True)
    user = pw.ForeignKeyField(Users)
    platform = pw.ForeignKeyField(Platforms)
    createdAt = pw.DateTimeField(null=True, default=datetime.now())

    class Meta:
        indexes = ((('user_id', 'platform_id'), True),)