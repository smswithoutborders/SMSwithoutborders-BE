from peewee import CharField
from peewee import DateTimeField
from peewee import IntegerField

from src.schemas.baseModel import BaseModel

from datetime import datetime

class Svretries(BaseModel):
    userId = CharField(null=True, column_name="userId")
    uniqueId = CharField(null=True, column_name="uniqueId")
    count = IntegerField(null=True)
    expires = DateTimeField(null=True)
    createdAt = DateTimeField(null=True, default=datetime.now)