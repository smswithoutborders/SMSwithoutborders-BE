"""Peewee Database ORM Models."""

import datetime
from peewee import (
    Model,
    CharField,
    TextField,
    DateTimeField,
    IntegerField,
    UUIDField,
    ForeignKeyField,
    BlobField,
)
from src.db import connect
from src.utils import create_tables
from settings import Configurations

database = connect()


class Entity(Model):
    """Model representing Entities Table."""

    eid = UUIDField(primary_key=True)
    phone_number_hash = CharField()
    password_hash = CharField()
    country_code = CharField()
    device_id = CharField(null=True)
    client_publish_pub_key = TextField(null=True)
    client_device_id_pub_key = TextField(null=True)
    publish_keypair = BlobField(null=True)
    device_id_keypair = BlobField(null=True)
    server_state = BlobField(null=True)
    date_created = DateTimeField(default=datetime.datetime.now)

    class Meta:
        """Meta class to define database connection."""

        database = database
        table_name = "entities"
        indexes = (
            (("phone_number_hash",), True),
            (("device_id",), True),
        )


class OTPRateLimit(Model):
    """Model representing OTP Rate Limits Table."""

    phone_number = CharField()
    attempt_count = IntegerField(default=0)
    date_expires = DateTimeField(null=True)
    date_created = DateTimeField(default=datetime.datetime.now)

    class Meta:
        """Meta class to define database connection."""

        database = database
        table_name = "otp_rate_limit"
        indexes = ((("phone_number",), True),)


class Token(Model):
    """Model representing Tokens Table."""

    eid = ForeignKeyField(Entity, backref="tokens", column_name="eid")
    platform = CharField()
    account_identifier_hash = CharField()
    account_identifier = CharField()
    account_tokens = TextField()
    date_created = DateTimeField(default=datetime.datetime.now)

    class Meta:
        """Meta class to define database connection."""

        database = database
        table_name = "tokens"
        indexes = ((("platform", "account_identifier_hash"), True),)


if Configurations.MODE in ("production", "development"):
    create_tables([Entity, OTPRateLimit, Token])
