from peewee import CharField
from peewee import DateTimeField
from peewee import TextField

from schemas.baseModel import BaseModel

from datetime import datetime

class Sessions(BaseModel):
    sid = CharField(primary_key=True)
    unique_identifier = CharField(null=True)
    user_agent = CharField(null=True)
    expires = DateTimeField(null=True)
    data = TextField(null=True)
    status = CharField(null=True)
    type = CharField(null=True)
    createdAt = DateTimeField(null=True, default=datetime.now)
