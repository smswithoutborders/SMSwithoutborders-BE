from peewee import CharField
from peewee import TextField
from peewee import DateTimeField
from playhouse.mysql_ext import JSONField

from schemas.baseModel import BaseModel

from datetime import datetime

class Platforms(BaseModel):
    name = CharField(unique=True, null=False)
    descriptions = JSONField(null=True)
    logo = CharField(null=True)
    protocol = CharField(null=True)
    type = CharField(null=True)
    letter = CharField(null=True)
    createdAt = DateTimeField(null=True, default=datetime.now)
