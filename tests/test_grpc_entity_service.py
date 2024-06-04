"""Test module for entity grpc service."""

import grpc
import pytest
from peewee import SqliteDatabase
from grpc_testing import server_from_dictionary, strict_real_time

import vault_pb2

from src.utils import create_tables, set_configs


@pytest.fixture()
def set_testing_mode():
    """Set the application mode to testing."""
    set_configs("MODE", "testing")


@pytest.fixture(autouse=True)
def setup_teardown_database(tmp_path, set_testing_mode):
    """Fixture for setting up and tearing down the test database."""
    from src.models import Entity, OTPRateLimit

    db_path = tmp_path / "test.db"
    test_db = SqliteDatabase(db_path)
    test_db.bind([Entity, OTPRateLimit])
    test_db.connect()
    create_tables([Entity, OTPRateLimit])

    yield

    test_db.drop_tables([Entity])
    test_db.close()


@pytest.fixture()
def grpc_server_mock(set_testing_mode):
    """Fixture for mocking the gRPC server."""
    from src.grpc_entity_service import EntityService

    servicers = {vault_pb2.DESCRIPTOR.services_by_name["Entity"]: EntityService()}
    test_server = server_from_dictionary(servicers, strict_real_time())
    return test_server


@pytest.fixture(autouse=True)
def keystore_path(tmp_path):
    """Fixture for setting the keystore path."""
    set_configs("KEYSTORE_PATH", str(tmp_path))


def test_entity_initiate_creation_success(grpc_server_mock):
    """Test case for successful entity creation."""
    request_data = {"phone_number": "+237123456789"}
    request = vault_pb2.CreateEntityRequest(**request_data)

    create_entity_method = grpc_server_mock.invoke_unary_unary(
        method_descriptor=(
            vault_pb2.DESCRIPTOR.services_by_name["Entity"].methods_by_name[
                "CreateEntity"
            ]
        ),
        invocation_metadata={},
        request=request,
        timeout=1,
    )

    response, _, code, _ = create_entity_method.termination()

    assert code == grpc.StatusCode.OK
    assert response.requires_ownership_proof is True
    assert isinstance(response.next_attempt_timestamp, int)
    assert response.message == "OTP sent successfully. Check your phone for the code."
