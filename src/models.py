"""Peewee Database ORM Models."""

import datetime
from peewee import Model, CharField, TextField, DateTimeField, IntegerField, UUIDField
from src.db import connect
from src.utils import create_tables
from settings import Configurations

database = connect()


class Entity(Model):
    """Model representing Entities Table."""

    eid = UUIDField(primary_key=True)
    phone_number_hash = CharField(index=True)
    password_hash = CharField()
    country_code = CharField()
    publish_pub_key = TextField(null=True)
    device_id_pub_key = TextField(null=True)
    crypto_metadata = TextField(null=True)

    class Meta:
        """Meta class to define database connection."""

        database = database
        table_name = "entities"


class OTPRateLimit(Model):
    """Model representing OTP Rate Limits Table."""

    phone_number = CharField(primary_key=True)
    attempt_count = IntegerField(default=0)
    date_expires = DateTimeField(null=True)
    date_created = DateTimeField(default=datetime.datetime.now)

    class Meta:
        """Meta class to define database connection."""

        database = database
        table_name = "otp_rate_limit"


if Configurations.MODE in ("production", "development"):
    create_tables([Entity, OTPRateLimit])
