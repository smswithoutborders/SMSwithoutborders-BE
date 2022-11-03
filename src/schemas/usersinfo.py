from peewee import CharField
from peewee import DateTimeField
from peewee import ForeignKeyField

from src.schemas.baseModel import BaseModel
from src.schemas.users import Users

from datetime import datetime

class UsersInfos(BaseModel):
    name = CharField(null=True)
    country_code = CharField(null=True)
    full_phone_number = CharField(null=True)
    status = CharField(default="unverified")
    userId = ForeignKeyField(Users, column_name="userId")
    iv = CharField(null=True)
    createdAt = DateTimeField(null=True, default=datetime.now)

    class Meta:
        table_name = 'usersInfos'