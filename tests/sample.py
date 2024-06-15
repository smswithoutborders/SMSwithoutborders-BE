import base64
import struct
import grpc

import vault_pb2
import vault_pb2_grpc

from smswithoutborders_libsig.keypairs import x25519
from smswithoutborders_libsig.ratchets import Ratchets, States
from src.device_id import compute_device_id


def main():
    try:
        channel = grpc.insecure_channel("localhost:6000")

        with channel as conn:
            stub = vault_pb2_grpc.EntityStub(conn)

            client_path = "/home/megamind/promisefru/sample.db"
            client_path_1 = "/home/megamind/promisefru/sample1.db"
            keypair_obj = x25519(client_path)
            peer_pub_key = keypair_obj.init()

            a_request_data = {
                "phone_number": "+23712345678900",
                "ownership_proof_response": "123456",
                "country_code": "CM",
                "password": "Password@1234",
                "client_publish_pub_key": base64.b64encode(peer_pub_key).decode(
                    "utf-8"
                ),
                "client_device_id_pub_key": base64.b64encode(peer_pub_key).decode(
                    "utf-8"
                ),
            }

            a_request = vault_pb2.CreateEntityRequest(**a_request_data)
            a_response = stub.CreateEntity(a_request)

            print(a_response)

            server_pub = base64.b64decode(a_response.server_publish_pub_key)
            sk = keypair_obj.agree(server_pub)

            original_plaintext = b"Hello world"
            client_state = States()
            Ratchets.alice_init(
                client_state,
                sk,
                server_pub,
                client_path_1,
            )
            header, client_ciphertext = Ratchets.encrypt(
                client_state,
                original_plaintext,
                server_pub,
            )

            len_header = len(header)
            transmission_text = base64.b64encode(
                struct.pack("<i", len_header) + header + client_ciphertext
            )

            b_request_data = {
                "device_id": compute_device_id(sk, "+23712345678900", server_pub),
                "payload_ciphertext": transmission_text,
            }

            b_request = vault_pb2.GetEntityAccessTokenAndDecryptPayloadRequest(
                **b_request_data
            )
            b_response = stub.GetEntityAccessTokenAndDecryptPayload(b_request)

            print(b_response)
    except grpc.RpcError as e:
        return None, e
    except Exception as e:
        raise e


if __name__ == "__main__":
    main()
