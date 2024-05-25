# Vault gRPC Documentation

## Table of Contents

- [Structure](#structure)
- [Usage](#usage)
- [1. Creating an Entity (Account)](#1-creating-an-entity-account)
  - [Step 1: Proof of Ownership](#step-1-proof-of-ownership)
  - [Step 2: Registration](#step-2-registration)

## Structure

- **[protos/](../protos/)**: This directory contains the Protocol Buffer
  (.proto) files used for defining gRPC services and messages. These files serve
  as the single source of truth for the gRPC APIs, ensuring consistent
  communication structures between server and client implementations.

1. **Install Dependencies**: First, ensure that the necessary dependencies,

   ```bash
   pip install -r requirements.txt
   ```

2. **Generate Code**: Use the `protoc` compiler to generate Python code from the
   `.proto` files.

   ```bash
   python3 -m grpc_tools.protoc -I./protos --python_out=. --pyi_out=. --grpc_python_out=. ./protos/*.proto
   ```

### Usage

> [!NOTE]
>
> Before using the provided protobuf definitions, ensure that you compile them
> using the protobuf compiler. This is necessary for generating the necessary
> gRPC client and server code for your chosen programming language.

---

## 1. Creating an Entity (Account)

To create an entity (an account) in the vault, follow these steps:

### Step 1: Proof of Ownership

Before creating an entity, you must prove that you own the phone number you
intend to use. This step helps ensure the security and authenticity of the
entity creation process.

- **Request Parameters**:
  - **phone_number**: The phone number associated with the entity. Should be in
    the [E164 format](https://en.wikipedia.org/wiki/E.164).

The response will indicate the status of the request:

- `INVALID_ARGUMENT`: Indicates a missing required field. The `details` in the
  response will specify which field should be provided.
- `ALREADY_EXISTS`: Indicates that the phone number you're trying to use is
  already associated with a registered entity in the vault.
- `OK`: Indicates the proof of ownership request has been made successfully. A
  code will be sent to the provided phone number, which should be used in the
  next step.
  - The `next_attempt` field in the response indicates the next available time
    to request another proof of ownership (in Unix seconds), in case the first
    attempt fails.
  - The `requires_ownership_proof` field in the response will be `true`,
    signifying that proof of ownership is required to proceed with entity
    creation.

#### Example (Python)

```python
import grpc
import vault_pb2
import vault_pb2_grpc

def create_entity_proof_of_own():
    channel = grpc.insecure_channel('localhost:50051')
    stub = vault_pb2_grpc.EntityStub(channel)

    request = vault_pb2.CreateEntityRequest(
        phone_number="+1234567890"
    )

    response = stub.CreateEntity(request)
    print("Entity creation response:", response)

if __name__ == '__main__':
    create_entity_proof_of_own()
```

### Response

```json
{
	"requires_ownership_proof": true,
	"peer_publish_pub_key": "",
	"message": "",
	"next_attempt": 112233
}
```

### Step 2: Registration

After completing Step 1 and receiving the proof (OTP), you'll be required to
complete the entity registration with fields used to identify and create an
entity.

- **Request Parameters**:
  - **phone_number**: The phone number associated with the entity. Should be in
    the [E164 format](https://en.wikipedia.org/wiki/E.164).
  - **country_code**: The
    [ISO 3166-1 alpha-2 code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
    associated with the phone number.
  - **password**: A secure password for the entity.
  - **username**: (Optional) A username for the entity.
  - **publish_pub_key**: The public key for publishing. Should be base64
    encoded.
  - **device_id_pub_key**: The public key associated with the device ID. Should
    be base64 encoded.

The response will indicate the status of the request:

- `INVALID_ARGUMENT`: Indicates a missing required field or a weak password. The
  `details` in the response will specify which field should be provided.
- `ALREADY_EXISTS`: Indicates that the phone number you're trying to use is
  already associated with a registered entity in the vault.
- `UNAUTHENTICATED`: Indicates that the proof provided is invalid.
- `OK`: Indicates the proof of ownership response is valid, and the entity has
  been successfully added to the vault.
  - The `peer_publish_pub_key` field in the response indicates the DH handshake
    peer public key for publishing. It's base64 encoded.

#### Example (Python)

```python
import grpc
import vault_pb2
import vault_pb2_grpc

def register_entity():
    channel = grpc.insecure_channel('localhost:50051')
    stub = vault_pb2_grpc.EntityStub(channel)

    request = vault_pb2.CreateEntityRequest(
        phone_number="+1234567890",
        ownership_proof_response="112233",
        country_code="+1",
        password="mySecurePassword123",
        username="myUsername", # Optional
        publish_pub_key="base64encodedPublicKey",
        device_id_pub_key="base64encodedDevicePublicKey"
    )

    response = stub.CreateEntity(request)
    print("Entity registration response:", response)

if __name__ == '__main__':
    register_entity()
```

### Response

```json
{
	"peer_publish_pub_key": "base64encodedPublicKey",
	"message": "Entity registered successfully!"
}
```
