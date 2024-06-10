"""
Entity's Tokens Controllers
"""

from peewee import DoesNotExist
from src.db_models import Token

database = Token._meta.database


def create_entity_token(
    entity,
    platform,
    account_identifier_hash,
    account_identifier,
    account_tokens,
    **kwargs
):
    """
    Create a new token associated with an entity.

    Args:
        entity (Entity): The entity associated with the token.
        platform (str): The platform name.
        account_identifier_hash (str): The hashed account identifier.
        account_identifier (str): The account identifier.
        account_tokens (str): The token data.
        **kwargs: Additional fields.

    Returns:
        Token: The created token object.
    """
    with database.atomic():
        token_data = {
            "eid": entity,
            "platform": platform,
            "account_identifier_hash": account_identifier_hash,
            "account_identifier": account_identifier,
            "account_tokens": account_tokens,
            **kwargs,
        }
        token = Token.create(**token_data)
    return token


def find_entity_token(entity, **search_criteria):
    """
    Find a token associated with the given entity by the given search criteria.

    Args:
        entity (Entity): The entity associated with the token.
        **search_criteria: Keyword arguments representing the fields
            and their values to search for.

    Returns:
        Token or None: The found token if exists, else None.
    """
    try:
        return entity.tokens.get(**search_criteria)
    except DoesNotExist:
        return None
