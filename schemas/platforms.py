import peewee as pw
from schemas.baseModel import BaseModel
from datetime import datetime

class Platforms(BaseModel):
    name = pw.CharField(unique=True, null=False)
    description = pw.CharField(null=True)
    logo = pw.CharField(null=True)
    protocols = pw.TextField(null=True)
    type = pw.CharField(null=True)
    letter = pw.CharField(null=True)
    createdAt = pw.DateTimeField(null=True, default=datetime.now())
