"""Entity Controllers"""

from peewee import DoesNotExist
from src.db_models import Entity

database = Entity._meta.database


def create_entity(eid, phone_number_hash, password_hash, country_code, **kwargs):
    """
    Create a new entity.

    Args:
        eid (str): The ID of the entity.
        phone_number_hash (str): The hashed phone number of the entity.
        password_hash (str): The hashed password of the entity.
        **kwargs: Additional fields include username, publish_pub_key,
            device_id_pub_key.

    Returns:
        Entity: The created entity object.
    """
    with database.atomic():
        entity_data = {
            "eid": eid,
            "phone_number_hash": phone_number_hash,
            "password_hash": password_hash,
            "country_code": country_code,
            **kwargs,
        }
        entity = Entity.create(**entity_data)
    return entity


def find_entity(**search_criteria):
    """
    Find an entity by the given search criteria.

    Args:
        **search_criteria: Keyword arguments representing the fields
            and their values to search for.

    Returns:
        Entity or None: The found entity if exists, else None.
    """
    try:
        return Entity.get(**search_criteria)
    except DoesNotExist:
        return None
