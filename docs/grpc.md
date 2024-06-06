# Vault gRPC Documentation

## Table of Contents

- [Download Protocol Buffer File](#download-protocol-buffer-file)
  - [Version 1](#version-1)
- [Prerequisites](#prerequisites)
- [Usage](#usage)
  - [Create an Entity](#create-an-entity)
    - [Initiate Creation](#initiate-creation)
    - [Complete Creation](#complete-creation)
  - [Authenticate an Entity](#authenticate-an-entity)
    - [Initiate Authentication](#initiate-authentication)
    - [Complete Authentication](#complete-authentication)

## Download Protocol Buffer File

To use the gRPC functions, download the protocol buffer file from the
[proto](/protos/) directory corresponding to the desired version.

### Version 1

```bash
curl -O -L https://raw.githubusercontent.com/smswithoutborders/SMSwithoutborders-BE/feature/grpc_api/protos/v1/vault.proto
```

## Prerequisites

To add relevant documentation links to the provided instructions, you can modify
the text like this:

### Install Dependencies

If you're using Python, install the necessary dependencies from
`requirements.txt`. For other languages, see
[Supported languages](https://grpc.io/docs/languages/).

```bash
pip install -r requirements.txt
```

### Compile gRPC for Python

If you're using Python, compile the gRPC files with `protoc` to generate the
necessary Python files. For other languages, see
[Supported languages](https://grpc.io/docs/languages/).

```bash
python -m grpc_tools.protoc -I protos/v1 --python_out=. --grpc_python_out=. protos/v1/vault.proto
```

### Starting the Server

**Quick Start (for Development Only):**

```bash
HASHING_SALT=/path/to/hashing.key \
SHARED_KEY=/path/to/shared.key \
KEYSTORE_PATH=/path/to/key_store \
SQLITE_DATABASE_PATH=/path/to/local.db \
GRPC_PORT=6000 \
HOST=127.0.0.1 \
python3 grpc_server.py
```

## Usage

### Create an Entity

An entity represents a user or client in the vault.

#### Initiate Creation

Before creating an entity, you must prove ownership of the phone number you
intend to use. This step ensures the security and authenticity of the entity
creation process.

---

> `request` **CreateEntityRequest**

> [!IMPORTANT]
>
> The table lists only the required fields for this step. Other fields will be
> ignored.

| Field        | Type   | Description                                                                                                                           |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| phone_number | string | The phone number associated with the entity. It should be in [E164 format](https://en.wikipedia.org/wiki/E.164). e.g., +237123456789. |

---

> `response` **CreateEntityResponse**

> [!IMPORTANT]
>
> The table lists only the fields that are populated for this step. Other fields
> may be empty, omitted, or false.

| Field                    | Type   | Description                                                                                                 |
| ------------------------ | ------ | ----------------------------------------------------------------------------------------------------------- |
| requires_ownership_proof | bool   | An indicator if proof of ownership is required. `true` if required, `false` otherwise.                      |
| next_attempt_timestamp   | int32  | The next available time to request another proof of ownership (in Unix seconds) if the first attempt fails. |
| message                  | string | A response message from the server.                                                                         |

---

> `method` **CreateEntity**

> [!TIP]
>
> The examples below use
> [grpcurl](https://github.com/fullstorydev/grpcurl#grpcurl).

> [!NOTE]
>
> Here is what a successful response from the server looks like.
>
> The server would return a status code of `0 OK` if the API transaction goes
> through without any friction. Otherwise, it will return any other code out of
> the
> [17 codes supported by gRPC](https://grpc.github.io/grpc/core/md_doc_statuscodes.html).

---

**Sample request**

```bash
grpcurl -plaintext \
    -d '{"phone_number": "+237123456789"}' \
    -proto protos/v1/vault.proto \
localhost:6000 vault.v1.Entity/CreateEntity
```

---

**Sample response**

```json
{
	"requiresOwnershipProof": true,
	"message": "OTP sent successfully. Check your phone for the code.",
	"nextAttemptTimestamp": 1717323582
}
```

---

#### Complete Creation

> [!WARNING]
>
> Ensure that you have completed the [Initiate Creation](#initiate-creation)
> step before executing this step.

---

> `request` **CreateEntityRequest**

> [!IMPORTANT]
>
> The table lists only the required fields for this step. Other fields will be
> ignored.

| Field                    | Type   | Description                                                                                                                                |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| phone_number             | string | The phone number associated with the entity. It should be in [E164 format](https://en.wikipedia.org/wiki/E.164). e.g., +237123456789.      |
| country_code             | string | The [ISO 3166-1 alpha-2 code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) associated with the phone number. e.g., `CM` for Cameroon. |
| password                 | string | A secure password for the entity.                                                                                                          |
| ownership_proof_response | string | The proof response from the previous step.                                                                                                 |
| client_publish_pub_key   | string | An `X25519` public key for publishing, `base64 encoded`.                                                                                   |
| client_device_id_pub_key | string | An `X25519` public key for device ID, `base64 encoded`.                                                                                    |

---

> `response` **CreateEntityResponse**

> [!IMPORTANT]
>
> The table lists only the fields that are populated for this step. Other fields
> may be empty, omitted, or false.

| Field                    | Type   | Description                                                                |
| ------------------------ | ------ | -------------------------------------------------------------------------- |
| message                  | string | A response message from the server.                                        |
| server_publish_pub_key   | string | An `X25519` public key for publishing, `base64 encoded`.                   |
| server_device_id_pub_key | string | An `X25519` public key for device ID, `base64 encoded`.                    |
| long_lived_token         | string | A token for the authenticated session, to be used for subsequent requests. |

---

> `method` **CreateEntity**

> [!TIP]
>
> The examples below use
> [grpcurl](https://github.com/fullstorydev/grpcurl#grpcurl).

> [!NOTE]
>
> Here is what a successful response from the server looks like.
>
> The server would return a status code of `0 OK` if the API transaction goes
> through without any friction. Otherwise, it will return any other code out of
> the
> [17 codes supported by gRPC](https://grpc.github.io/grpc/core/md_doc_statuscodes.html).

---

**Sample request**

```bash
grpcurl -plaintext \
    -d @ \
    -proto protos/v1/vault.proto \
localhost:6000 vault.v1.Entity/CreateEntity <payload.json
```

---

**Sample payload.json**

```json
{
	"country_code": "CM",
	"phone_number": "+237123456789",
	"password": "Password@123",
	"client_publish_pub_key": "x25519 client publish public key",
	"client_device_id_pub_key": "x25519 client device_id public key",
	"ownership_proof_response": "123456"
}
```

---

**Sample response**

```json
{
	"longLivedToken": "long_lived_token",
	"serverPublishPubKey": "x25519 server publish public key",
	"serverDeviceIdPubKey": "x25519 server publish public key",
	"message": "Entity created successfully"
}
```

---

### Authenticate an Entity

An entity represents a user or client in the vault.

#### Initiate Authentication

This step involves verifying the phone number and password, triggering a proof
of ownership for the phone number.

---

> `request` **AuthenticateEntityRequest**

> [!IMPORTANT]
>
> The table lists only the required fields for this step. Other fields will be
> ignored.

| Field        | Type   | Description                                                                                                                           |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| phone_number | string | The phone number associated with the entity. It should be in [E164 format](https://en.wikipedia.org/wiki/E.164). e.g., +237123456789. |
| password     | string | A secure password for the entity.                                                                                                     |

---

> `response` **AuthenticateEntityResponse**

> [!IMPORTANT]
>
> The table lists only the fields that are populated for this step. Other fields
> may be empty, omitted, or false.

| Field                    | Type   | Description                                                                                                 |
| ------------------------ | ------ | ----------------------------------------------------------------------------------------------------------- |
| requires_ownership_proof | bool   | An indicator if proof of ownership is required. `true` if required, `false` otherwise.                      |
| next_attempt_timestamp   | int32  | The next available time to request another proof of ownership (in Unix seconds) if the first attempt fails. |
| message                  | string | A response message from the server.                                                                         |

---

> `method` **AuthenticateEntity**

> [!TIP]
>
> The examples below use
> [grpcurl](https://github.com/fullstorydev/grpcurl#grpcurl).

> [!NOTE]
>
> Here is what a successful response from the server looks like.
>
> The server would return a status code of `0 OK` if the API transaction goes
> through without any friction. Otherwise, it will return any other code out of
> the
> [17 codes supported by gRPC](https://grpc.github.io/grpc/core/md_doc_statuscodes.html).

---

**Sample request**

```bash
grpcurl -plaintext \
    -d '{"phone_number": "+237123456789", "password": "Password@123"}' \
    -proto protos/v1/vault.proto \
localhost:6000 vault.v1.Entity/AuthenticateEntity
```

---

**Sample response**

```json
{
	"requiresOwnershipProof": true,
	"message": "OTP sent successfully. Check your phone for the code.",
	"nextAttemptTimestamp": 1717323582
}
```

---

#### Complete Authentication

> [!WARNING]
>
> Ensure that you have completed the
> [Initiate Authentication](#initiate-authentication) step before executing this
> step.

---

> `request` **AuthenticateEntityRequest**

> [!IMPORTANT]
>
> The table lists only the required fields for this step. Other fields will be
> ignored.

| Field                    | Type   | Description                                                                                                                           |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| phone_number             | string | The phone number associated with the entity. It should be in [E164 format](https://en.wikipedia.org/wiki/E.164). e.g., +237123456789. |
| ownership_proof_response | string | The proof response from the previous step.                                                                                            |
| client_publish_pub_key   | string | An `X25519` public key for publishing, `base64 encoded`.                                                                              |
| client_device_id_pub_key | string | An `X25519` public key for device ID, `base64 encoded`.                                                                               |

---

> `response` **AuthenticateEntityResponse**

> [!IMPORTANT]
>
> The table lists only the fields that are populated for this step. Other fields
> may be empty, omitted, or false.

| Field                    | Type   | Description                                                                |
| ------------------------ | ------ | -------------------------------------------------------------------------- |
| message                  | string | A response message from the server.                                        |
| server_publish_pub_key   | string | An `X25519` public key for publishing, `base64 encoded`.                   |
| server_device_id_pub_key | string | An `X25519` public key for device ID, `base64 encoded`.                    |
| long_lived_token         | string | A token for the authenticated session, to be used for subsequent requests. |

---

> `method` **AuthenticateEntity**

> [!TIP]
>
> The examples below use
> [grpcurl](https://github.com/fullstorydev/grpcurl#grpcurl).

> [!NOTE]
>
> Here is what a successful response from the server looks like.
>
> The server would return a status code of `0 OK` if the API transaction goes
> through without any friction. Otherwise, it will return any other code out of
> the
> [17 codes supported by gRPC](https://grpc.github.io/grpc/core/md_doc_statuscodes.html).

---

**Sample request**

```bash
grpcurl -plaintext \
    -d @ \
    -proto protos/v1/vault.proto \
localhost:6000 vault.v1.Entity/AuthenticateEntity <payload.json
```

---

**Sample payload.json**

```json
{
	"phone_number": "+237123456789",
	"client_publish_pub_key": "x25519 client publish public key",
	"client_device_id_pub_key": "x25519 client device_id public key",
	"ownership_proof_response": "123456"
}
```

---

**Sample response**

```json
{
	"longLivedToken": "long_lived_token",
	"serverPublishPubKey": "x25519 server publish public key",
	"serverDeviceIdPubKey": "x25519 server publish public key",
	"message": "Entity authenticated successfully!"
}
```
