"""Test module for entity controller functions."""

import pytest
from peewee import SqliteDatabase
from src.utils import create_tables, set_configs


@pytest.fixture()
def set_testing_mode():
    """Set the application mode to testing."""
    set_configs("MODE", "testing")


@pytest.fixture(autouse=True)
def setup_teardown_database(tmp_path, set_testing_mode):
    """Fixture for setting up and tearing down the test database."""
    from src.models import Entity

    db_path = tmp_path / "test.db"
    test_db = SqliteDatabase(db_path)
    test_db.bind([Entity])
    test_db.connect()
    create_tables([Entity])

    yield

    test_db.drop_tables([Entity])
    test_db.close()


def test_create_entity_required_fields():
    """Test creation of an entity with required fields."""
    from src.entity import create_entity

    eid = "eid1"
    phone_number_hash = "phone_hash1"
    password_hash = "password_hash1"
    country_code = "+237"

    entity = create_entity(eid, phone_number_hash, password_hash, country_code)

    assert entity is not None
    assert entity.eid == eid
    assert entity.phone_number_hash == phone_number_hash
    assert entity.password_hash == password_hash
    assert entity.country_code == country_code


def test_create_entity_additional_fields():
    """Test creation of an entity with additional fields."""
    from src.entity import create_entity

    eid = "eid2"
    phone_number_hash = "phone_hash2"
    password_hash = "password_hash2"
    country_code = "+237"
    publish_pub_key = "-----BEGIN PUBLIC KEY-----\n1234\n-----END PUBLIC KEY-----"
    device_id_pub_key = (
        "-----BEGIN DEVICE PUBLIC KEY-----\n1234\n-----END DEVICE PUBLIC KEY-----"
    )

    entity = create_entity(
        eid,
        phone_number_hash,
        password_hash,
        country_code,
        publish_pub_key=publish_pub_key,
        device_id_pub_key=device_id_pub_key,
    )

    assert entity is not None
    assert entity.eid == eid
    assert entity.phone_number_hash == phone_number_hash
    assert entity.password_hash == password_hash
    assert entity.country_code == country_code
    assert entity.publish_pub_key == publish_pub_key
    assert entity.device_id_pub_key == device_id_pub_key


def test_find_entity_by_single_criterion():
    """Test finding an entity by a single criterion."""
    from src.entity import create_entity, find_entity

    eid = "eid3"
    phone_number_hash = "phone_hash3"
    password_hash = "password_hash3"
    country_code = "+237"

    create_entity(eid, phone_number_hash, password_hash, country_code)
    entity = find_entity(eid=eid)

    assert entity is not None
    assert entity.eid == eid


def test_find_entity_by_multiple_criteria():
    """Test finding an entity by multiple criteria."""
    from src.entity import create_entity, find_entity

    eid = "eid4"
    phone_number_hash = "phone_hash4"
    password_hash = "password_hash4"
    country_code = "+237"

    create_entity(eid, phone_number_hash, password_hash, country_code)
    entity = find_entity(eid=eid, phone_number_hash=phone_number_hash)

    assert entity is not None
    assert entity.eid == eid


def test_find_entity_not_exist():
    """Test finding an entity that does not exist."""
    from src.entity import find_entity

    entity = find_entity(eid="nonexistent")
    assert entity is None
