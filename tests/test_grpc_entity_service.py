import grpc
import pytest
from grpc_testing import server_from_dictionary, strict_real_time

import vault_pb2

from src.grpc_entity_service import EntityService


@pytest.fixture(scope="module")
def grpc_server_mock():
    servicers = {vault_pb2.DESCRIPTOR.services_by_name["Entity"]: EntityService()}
    test_server = server_from_dictionary(servicers, strict_real_time())
    return test_server


def test_create_entity_init(grpc_server_mock):
    request_data = {"phone_number": "123456789"}
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

    response, metadata, code, details = create_entity_method.termination()

    print(response)
    assert code == grpc.StatusCode.OK
