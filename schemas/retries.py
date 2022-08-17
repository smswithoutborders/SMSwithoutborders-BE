from peewee import CharField
from peewee import DateTimeField
from peewee import IntegerField

from schemas.baseModel import BaseModel

from datetime import datetime

class Retries(BaseModel):
    uniqueId = CharField(null=True, column_name="uniqueId")
    count = IntegerField(null=True)
    block = IntegerField(null=True)
    expires = DateTimeField(null=True)
    createdAt = DateTimeField(null=True, default=datetime.now)