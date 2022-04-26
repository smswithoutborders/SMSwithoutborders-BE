from email.policy import default
import peewee as pw
from schemas.baseModel import BaseModel
from datetime import datetime
from uuid import uuid1

class Users(BaseModel):
    id = pw.CharField(primary_key=True, default=uuid1)
    password = pw.CharField(null=True)
    last_login = pw.DateTimeField(null=True)
    createdAt = pw.DateTimeField(null=True, default=datetime.now())