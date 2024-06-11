"""
Entity's Tokens Controllers
"""

from playhouse.shortcuts import model_to_dict
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


def fetch_entity_tokens(entity, fetch_all=False, fields=None, **search_criteria):
    """
    Fetch tokens associated with the given entity based on the provided search criteria,
    or retrieve all tokens associated with the entity if fetch_all is set to True.

    Args:
        entity (Entity): The entity associated with the tokens.
        fetch_all (bool, optional): If True, fetch all tokens associated with the entity
            regardless of search criteria. If False (default), fetch tokens based on search criteria.
        fields (list[str] or None, optional): Optional list of fields to select.
        **search_criteria: Additional keyword arguments representing the fields
            and their values to search for.

    Returns:
        list[dict]: A list of dictionaries containing token data.
    """
    results = []

    with database.atomic():
        query = entity.tokens

        if not fetch_all and search_criteria:
            conditions = [
                getattr(Token, key) == value
                for key, value in search_criteria.items()
                if value is not None
            ]
            query = query.where(*conditions)

        if fields:
            select = (getattr(Token, key) for key in fields)
            query = query.select(*select)

        tokens = query.execute()

        for token in tokens:
            token_dict = model_to_dict(token)
            results.append(token_dict)

    return remove_none_values(results)


def remove_none_values(values):
    """
    Removes None values from a list of dictionaries.

    Args:
        values (list): A list of dictionaries.

    Returns:
        list: A new list of dictionaries where None values have been removed.

    Example:
        values = [
            {"a": 1, "b": None, "c": 3},
            {"a": None, "b": 2, "c": 3},
            {"a": 1, "b": 2, "c": None}
        ]
        filtered_values = remove_none_values(values)
        print(filtered_values)
        # Output: [{'a': 1, 'c': 3}, {'b': 2, 'c': 3}, {'a': 1, 'b': 2}]
    """
    return [{k: v for k, v in value.items() if v is not None} for value in values]
