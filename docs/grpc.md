# Vault gRPC Documentation

## Table of Contents

- [Structure](#structure)
- [Usage](#usage)
  1. [Creating an Entity (Account)](#1-creating-an-entity-account)
     - [Step 1: Proof of Ownership](#step-1-proof-of-ownership)
     - [Step 2: Registration](#step-2-registration)
  2. [Authenticate Entity (Account)](#2-authenticate-entity-account)
     - [Step 1: Initiate Authentication](#step-1-initiate-authentication)
     - [Step 2: Complete Authentication](#step-2-complete-authentication)

## Structure

- **[protos/](../protos/)**: This directory contains the Protocol Buffer
  (.proto) files used for defining gRPC services and messages. These files serve
  as the single source of truth for the gRPC APIs, ensuring consistent
  communication structures between server and client implementations.

1. **Install Dependencies**: First, ensure that the necessary dependencies are
   installed:

   ```bash
   pip install -r requirements.txt
   ```

2. **Generate Code**: Use the `protoc` compiler to generate Python code from the
   `.proto` files:

   ```bash
   python3 -m grpc_tools.protoc -I./protos --python_out=. --pyi_out=. --grpc_python_out=. ./protos/*.proto
   ```

### Usage

> [!NOTE]
>
> Before using the provided protobuf definitions, ensure that you compile them
> using the protobuf compiler. This is necessary for generating the required
> gRPC client and server code for your chosen programming language.

---

## 1. Creating an Entity (Account)

To create an entity (account) in the vault, follow these steps:

### Step 1: Proof of Ownership

Before creating an entity, you must prove ownership of the phone number you
intend to use. This step ensures the security and authenticity of the entity
creation process.

- **Request Parameters**:
  - **phone_number**: The phone number associated with the entity. It should be
    in [E164 format](https://en.wikipedia.org/wiki/E.164).

The response will indicate the status of the request:

- `INVALID_ARGUMENT`: Missing required field. The `details` in the response will
  specify the missing field.
- `ALREADY_EXISTS`: The phone number is already associated with a registered
  entity in the vault.
- `OK`: The proof of ownership request was successful. A code will be sent to
  the provided phone number to be used in the next step.
  - `next_attempt`: The next available time to request another proof of
    ownership (in Unix seconds) if the first attempt fails.
  - `requires_ownership_proof`: `true`, indicating that proof of ownership is
    required to proceed with entity creation.

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

After completing Step 1 and receiving the proof (OTP), complete the entity
registration with fields used to identify and create an entity.

- **Request Parameters**:
  - **phone_number**: The phone number associated with the entity. It should be
    in [E164 format](https://en.wikipedia.org/wiki/E.164).
  - **country_code**: The
    [ISO 3166-1 alpha-2 code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
    associated with the phone number.
  - **password**: A secure password for the entity.
  - **username**: (Optional) A username for the entity.
  - **publish_pub_key**: The public key for publishing, base64 encoded.
  - **device_id_pub_key**: The public key associated with the device ID, base64
    encoded.

The response will indicate the status of the request:

- `INVALID_ARGUMENT`: Missing required field or weak password. The `details` in
  the response will specify the issue.
- `ALREADY_EXISTS`: The phone number is already associated with a registered
  entity in the vault.
- `UNAUTHENTICATED`: The proof provided is invalid.
- `OK`: The proof of ownership response is valid, and the entity has been
  successfully added to the vault.
  - `peer_publish_pub_key`: The DH handshake peer public key for publishing,
    base64 encoded.

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
        country_code="US",
        password="mySecurePassword123",
        username="myUsername",  # Optional
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
	"requires_ownership_proof": false,
	"peer_publish_pub_key": "base64encodedPublicKey",
	"message": "",
	"next_attempt": 0
}
```

## 2. Authenticate Entity (Account)

To authenticate an entity in the vault, follow these steps:

### Step 1: Initiate Authentication

This step involves verifying the phone number and password, triggering a proof
of ownership for the phone number.

- **Request Parameters**:
  - **phone_number**: The phone number associated with the entity. It should be
    in [E164 format](https://en.wikipedia.org/wiki/E.164).
  - **password**: The password for the entity.

The response will indicate the status of the request and whether ownership proof
is required:

- `INVALID_ARGUMENT`: Missing required field or incorrect format. The `details`
  in the response will specify the issue.
- `NOT_FOUND`: The provided phone number does not exist in the vault.
- `UNAUTHENTICATED`: Incorrect credentials provided.
- `OK`: The authentication request has been accepted, and a proof of ownership
  challenge has been triggered.
  - `next_attempt`: The next available time to request another proof of
    ownership (in Unix seconds) if the first attempt fails.
  - `requires_ownership_proof`: `true`, indicating that proof of ownership is
    required to proceed with authentication.
  - `phone_number_hash`: The hash of the entity's phone number to be used in the
    subsequent request to complete authentication.

#### Example (Python)

```python
import grpc
import vault_pb2
import vault_pb2_grpc

def initiate_authentication():
    channel = grpc.insecure_channel('localhost:50051')
    stub = vault_pb2_grpc.EntityStub(channel)

    request = vault_pb2.AuthenticateEntityRequest(
        phone_number="+1234567890",
        password="mySecurePassword123"
    )

    response = stub.AuthenticateEntity(request)
    print("Authentication initiation response:", response)

if __name__ == '__main__':
    initiate_authentication()
```

### Response

```json
{
	"requires_ownership_proof": true,
	"long_lived_token": "",
	"message": "",
	"phone_number_hash": "hash_of_phone_number",
	"next_attempt": 112233
}
```

### Step 2: Complete Authentication

After receiving the proof of ownership, use the phone_number_hash and the proof
response to complete the authentication.

- **Request Parameters**:
  - **phone_number_hash**: The phone number hash associated with the entity.
  - **publish_pub_key**: The public key for publishing, base64 encoded.
  - **device_id_pub_key**: The public key associated with the device ID, base64
    encoded.
  - **ownership_proof_response**: The proof response from the ownership step.

The response will indicate the status of the request and provide a long-lived
token if successful:

- `INVALID_ARGUMENT`: Missing required field or incorrect format. The `details`
  in the response will specify the issue.
- `NOT_FOUND`: The provided phone number hash does not exist in the vault.
- `UNAUTHENTICATED`: Invalid proof of ownership response.
- `OK`: The entity has been successfully authenticated.
  - `long_lived_token`: A token for the authenticated session, to be used for
    subsequent requests.

#### Example (Python)

```python
import grpc
import vault_pb2
import vault_pb2_grpc

def complete_authentication():
    channel = grpc.insecure_channel('localhost:50051')
    stub = vault_pb2_grpc.EntityStub(channel)

    request = vault_pb2.AuthenticateEntityRequest(
        phone_number_hash="hash_of_phone_number",
        publish_pub_key="base64encodedPublicKey",
        device_id_pub_key="base64encodedDevicePublicKey",
        ownership_proof_response="ownershipProof"
    )

    response = stub.AuthenticateEntity(request)
    print("Authentication completion response:", response)

if __name__ == '__main__':
    complete_authentication()
```

### Response

```json
{
	"long_lived_token": "longLivedAuthToken",
	"message": "Entity authenticated successfully!",
	"requires_ownership_proof": false,
	"phone_number_hash": ""
}
```
