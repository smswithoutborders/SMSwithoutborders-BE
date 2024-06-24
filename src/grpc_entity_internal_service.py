"""gRPC Entity Internal Service"""

import logging
import base64

import grpc

import vault_pb2
import vault_pb2_grpc

from src.entity import find_entity
from src.tokens import fetch_entity_tokens, create_entity_token
from src.crypto import generate_hmac
from src.utils import (
    load_key,
    get_configs,
    encrypt_and_encode,
    is_valid_x25519_public_key,
    decrypt_and_decode,
    load_keypair_object,
)
from src.long_lived_token import verify_llt
from src.relaysms_payload import (
    decode_relay_sms_payload,
    decrypt_payload,
)

HASHING_KEY = load_key(get_configs("HASHING_SALT"), 32)
SUPPORTED_PLATFORMS = ("gmail",)

logging.basicConfig(
    level=logging.INFO, format=("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
)
logger = logging.getLogger("[gRPC Entity Internal Service]")


def error_response(context, response, sys_msg, status_code, user_msg=None, _type=None):
    """
    Create an error response.

    Args:
        context: gRPC context.
        response: gRPC response object.
        sys_msg (str or tuple): System message.
        status_code: gRPC status code.
        user_msg (str or tuple): User-friendly message.
        _type (str): Type of error.

    Returns:
        An instance of the specified response with the error set.
    """
    if not user_msg:
        user_msg = sys_msg

    if _type == "UNKNOWN":
        logger.exception(sys_msg, exc_info=True)
    else:
        logger.error(sys_msg)

    context.set_details(user_msg)
    context.set_code(status_code)

    return response()


def validate_request_fields(context, request, response, required_fields):
    """
    Validates the fields in the gRPC request.

    Args:
        context: gRPC context.
        request: gRPC request object.
        response: gRPC response object.
        required_fields (list): List of required fields, can include tuples.

    Returns:
        None or response: None if no missing fields,
            error response otherwise.
    """
    missing_fields = []

    for field in required_fields:
        if isinstance(field, tuple):
            if not any(getattr(request, f, None) for f in field):
                missing_fields.append(f"({' or '.join(field)})")
        else:
            if not getattr(request, field, None):
                missing_fields.append(field)

    if missing_fields:
        return error_response(
            context,
            response,
            f"Missing required fields: {', '.join(missing_fields)}",
            grpc.StatusCode.INVALID_ARGUMENT,
        )

    x25519_fields = [
        "client_publish_pub_key",
        "client_device_id_pub_key",
    ]
    invalid_fields = {}

    for field in set(x25519_fields) & set(required_fields):
        is_valid, error = is_valid_x25519_public_key(getattr(request, field))
        if not is_valid:
            invalid_fields[field] = error

    if invalid_fields:
        return error_response(
            context,
            response,
            f"Invalid fields: {invalid_fields}",
            grpc.StatusCode.INVALID_ARGUMENT,
        )

    return None


def verify_long_lived_token(request, context, response):
    """
    Verifies the long-lived token from the request.

    Args:
        context: gRPC context.
        request: gRPC request object.
        response: gRPC response object.

    Returns:
        tuple: Tuple containing entity object, and error response.
    """

    def create_error_response(error_msg):
        return error_response(
            context,
            response,
            error_msg,
            grpc.StatusCode.UNAUTHENTICATED,
            user_msg=(
                "Your session has expired or the token is invalid. "
                "Please log in again to generate a new token."
            ),
        )

    try:
        eid, llt = request.long_lived_token.split(":", 1)
    except ValueError as err:
        return None, create_error_response(err)

    entity_obj = find_entity(eid=eid)
    if not entity_obj:
        return None, create_error_response(
            f"Possible token tampering detected. Entity not found with eid: {eid}"
        )

    entity_device_id_keypair = load_keypair_object(entity_obj.device_id_keypair)
    entity_device_id_shared_key = entity_device_id_keypair.agree(
        base64.b64decode(entity_obj.client_device_id_pub_key),
    )

    llt_payload, llt_error = verify_llt(llt, entity_device_id_shared_key)

    if not llt_payload:
        return None, create_error_response(llt_error)

    if llt_payload.get("eid") != eid:
        return None, create_error_response(
            f"Possible token tampering detected. EID mismatch: {eid}"
        )

    return entity_obj, None


class EntityInternalService(vault_pb2_grpc.EntityInternalServicer):
    """Entity Internal Service Descriptor"""

    def StoreEntityToken(self, request, context):
        """Handles storing tokens for an entity"""

        response = vault_pb2.StoreEntityTokenResponse

        try:
            invalid_fields_response = validate_request_fields(
                context,
                request,
                response,
                ["long_lived_token", "token", "platform", "account_identifier"],
            )
            if invalid_fields_response:
                return invalid_fields_response

            entity_obj, llt_error_response = verify_long_lived_token(
                request, context, response
            )
            if llt_error_response:
                return llt_error_response

            if request.platform.lower() not in SUPPORTED_PLATFORMS:
                raise NotImplementedError(
                    f"The platform '{request.platform}' is currently not supported. "
                    "Please contact the developers for more information on when "
                    "this platform will be implemented."
                )

            account_identifier_hash = generate_hmac(
                HASHING_KEY, request.account_identifier
            )

            existing_tokens = fetch_entity_tokens(
                entity=entity_obj,
                account_identifier_hash=account_identifier_hash,
                platform=request.platform,
            )

            if existing_tokens:
                return error_response(
                    context,
                    response,
                    "Entity already has a token associated with account "
                    f"identifier {request.account_identifier} for {request.platform}",
                    grpc.StatusCode.ALREADY_EXISTS,
                )

            new_token = {
                "entity": entity_obj,
                "platform": request.platform,
                "account_identifier_hash": account_identifier_hash,
                "account_identifier": encrypt_and_encode(request.account_identifier),
                "account_tokens": encrypt_and_encode(request.token),
            }
            create_entity_token(**new_token)
            logger.info("Successfully stored tokens for %s", entity_obj.eid)

            return response(
                message="Token stored successfully.",
                success=True,
            )

        except NotImplementedError as e:
            return error_response(
                context,
                response,
                str(e),
                grpc.StatusCode.UNIMPLEMENTED,
            )

        except Exception as e:
            return error_response(
                context,
                response,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )

    def DecryptPayload(self, request, context):
        """Handles decrypting relaysms payload"""

        response = vault_pb2.DecryptPayloadResponse

        def validate_fields():
            return validate_request_fields(
                context,
                request,
                response,
                ["device_id", "payload_ciphertext"],
            )

        def decode_message():
            header, content_ciphertext, decode_error = decode_relay_sms_payload(
                request.payload_ciphertext
            )

            if decode_error:
                return None, error_response(
                    context,
                    response,
                    decode_error,
                    grpc.StatusCode.INVALID_ARGUMENT,
                    user_msg="Invalid content format.",
                    _type="UNKNOWN",
                )

            return (header, content_ciphertext), None

        def decrypt_message(entity_obj, header, content_ciphertext):
            publish_keypair = load_keypair_object(entity_obj.publish_keypair)
            publish_shared_key = publish_keypair.agree(
                base64.b64decode(entity_obj.client_publish_pub_key)
            )

            content_plaintext, state, decrypt_error = decrypt_payload(
                server_state=entity_obj.server_state,
                publish_shared_key=publish_shared_key,
                publish_keypair=publish_keypair,
                ratchet_header=header,
                encrypted_content=content_ciphertext,
                publish_pub_key=publish_keypair.get_public_key(),
            )

            if decrypt_error:
                return error_response(
                    context,
                    response,
                    decrypt_error,
                    grpc.StatusCode.INVALID_ARGUMENT,
                    user_msg="Invalid content format.",
                    _type="UNKNOWN",
                )

            entity_obj.server_state = state.serialize()
            entity_obj.save()
            logger.info(
                "Successfully decrypted payload for %s",
                entity_obj.eid,
            )

            return response(
                message="Successfully decrypted payload",
                success=True,
                payload_plaintext=content_plaintext,
            )

        try:
            invalid_fields_response = validate_fields()
            if invalid_fields_response:
                return invalid_fields_response

            entity_obj = find_entity(device_id=request.device_id)

            if not entity_obj:
                return error_response(
                    context,
                    response,
                    f"Invalid device ID '{request.device_id}'. "
                    "Please log in again to obtain a valid device ID.",
                    grpc.StatusCode.UNAUTHENTICATED,
                )

            decoded_response, decoding_error = decode_message()
            if decoding_error:
                return decoding_error

            header, content_ciphertext = decoded_response

            return decrypt_message(entity_obj, header, content_ciphertext)

        except Exception as e:
            return error_response(
                context,
                response,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )

    def GetEntityAccessToken(self, request, context):
        """Handles getting an entity's access token."""

        response = vault_pb2.GetEntityAccessTokenResponse

        def validate_fields():
            return validate_request_fields(
                context,
                request,
                response,
                [("device_id", "long_lived_token"), "platform", "account_identifier"],
            )

        def fetch_tokens(entity_obj, account_identifier_hash):
            tokens = fetch_entity_tokens(
                entity=entity_obj,
                fields=["account_tokens"],
                return_json=True,
                platform=request.platform,
                account_identifier_hash=account_identifier_hash,
            )
            for token in tokens:
                for field in ["account_tokens"]:
                    if field in token:
                        token[field] = decrypt_and_decode(token[field])

            logger.info(
                "Successfully fetched tokens for %s",
                entity_obj.eid,
            )

            if not tokens:
                return error_response(
                    context,
                    response,
                    "No token found with account "
                    f"identifier {request.account_identifier} for {request.platform}",
                    grpc.StatusCode.NOT_FOUND,
                )

            return response(
                message="Successfully fetched tokens.",
                success=True,
                token=tokens[0]["account_tokens"],
            )

        try:
            invalid_fields_response = validate_fields()
            if invalid_fields_response:
                return invalid_fields_response

            if request.long_lived_token:
                entity_obj, llt_error_response = verify_long_lived_token(
                    request, context, response
                )
                if llt_error_response:
                    return llt_error_response
            elif request.device_id:
                entity_obj = find_entity(device_id=request.device_id)

                if not entity_obj:
                    return error_response(
                        context,
                        response,
                        f"Invalid device ID '{request.device_id}'. "
                        "Please log in again to obtain a valid device ID.",
                        grpc.StatusCode.UNAUTHENTICATED,
                    )

            if request.platform.lower() not in SUPPORTED_PLATFORMS:
                raise NotImplementedError(
                    f"The platform '{request.platform}' is currently not supported. "
                    "Please contact the developers for more information on when "
                    "this platform will be implemented."
                )

            account_identifier_hash = generate_hmac(
                HASHING_KEY, request.account_identifier
            )

            return fetch_tokens(entity_obj, account_identifier_hash)

        except NotImplementedError as e:
            return error_response(
                context,
                response,
                str(e),
                grpc.StatusCode.UNIMPLEMENTED,
            )

        except Exception as e:
            return error_response(
                context,
                response,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )

    def EncryptPayload(self, request, context):
        """Handles encrypting payload"""

        response = vault_pb2.EncryptPayloadResponse

        try:
            invalid_fields_response = validate_request_fields(
                context,
                request,
                response,
                ["device_id", "payload_plaintext"],
            )
            if invalid_fields_response:
                return invalid_fields_response

            entity_obj = find_entity(device_id=request.device_id)

            if not entity_obj:
                return error_response(
                    context,
                    response,
                    f"Invalid device ID '{request.device_id}'. "
                    "Please log in again to obtain a valid device ID.",
                    grpc.StatusCode.UNAUTHENTICATED,
                )

            # entity_publish_keypair = load_keypair_object(entity_obj.publish_keypair)
            # publish_shared_key = entity_publish_keypair.agree(
            #     base64.b64decode(entity_obj.client_publish_pub_key)
            # )

            # header, content_ciphertext, state = encrypt_payload(
            #     server_state=entity_obj.server_state,
            #     publish_shared_key=publish_shared_key,
            #     keypair=load_keypair_object(entity_obj.publish_keypair),
            #     content=request.payload_plaintext,
            #     client_pub_key=base64.b64decode(entity_obj.client_publish_pub_key),
            #     client_keystore_path=os.path.join(
            #         KEYSTORE_PATH, f"{entity_obj.eid.hex}_publish.db"
            #     ),
            # )

            # b64_encoded_content = encode_relay_sms_payload(header, content_ciphertext)

            # entity_obj.server_state = state.serialize()
            # entity_obj.save()
            b64_encoded_content = request.payload_plaintext

            return response(
                message="Successfully encrypted payload.",
                payload_ciphertext=b64_encoded_content,
                success=True,
            )

        except Exception as e:
            return error_response(
                context,
                response,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )

    def UpdateEntityToken(self, request, context):
        """Handles updating tokens for an entity"""

        response = vault_pb2.UpdateEntityTokenResponse

        try:
            invalid_fields_response = validate_request_fields(
                context,
                request,
                response,
                ["device_id", "token", "platform", "account_identifier"],
            )
            if invalid_fields_response:
                return invalid_fields_response

            entity_obj = find_entity(device_id=request.device_id)

            if not entity_obj:
                return error_response(
                    context,
                    response,
                    f"Invalid device ID '{request.device_id}'. "
                    "Please log in again to obtain a valid device ID.",
                    grpc.StatusCode.UNAUTHENTICATED,
                )

            account_identifier_hash = generate_hmac(
                HASHING_KEY, request.account_identifier
            )

            existing_tokens = fetch_entity_tokens(
                entity=entity_obj,
                account_identifier_hash=account_identifier_hash,
                platform=request.platform,
            )

            if not existing_tokens:
                return error_response(
                    context,
                    response,
                    "No token found with account "
                    f"identifier {request.account_identifier} for {request.platform}",
                    grpc.StatusCode.NOT_FOUND,
                )

            existing_tokens[0].account_tokens = encrypt_and_encode(request.token)
            existing_tokens[0].save()
            logger.info("Successfully updated token for %s", entity_obj.eid)

            return response(
                message="Token updated successfully.",
                success=True,
            )

        except Exception as e:
            return error_response(
                context,
                response,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )

    def DeleteEntityToken(self, request, context):
        """Handles deleting tokens for an entity"""

        response = vault_pb2.DeleteEntityTokenResponse

        try:
            invalid_fields_response = validate_request_fields(
                context,
                request,
                response,
                ["long_lived_token", "platform", "account_identifier"],
            )
            if invalid_fields_response:
                return invalid_fields_response

            entity_obj, llt_error_response = verify_long_lived_token(
                request, context, response
            )
            if llt_error_response:
                return llt_error_response

            if request.platform.lower() not in SUPPORTED_PLATFORMS:
                raise NotImplementedError(
                    f"The platform '{request.platform}' is currently not supported. "
                    "Please contact the developers for more information on when "
                    "this platform will be implemented."
                )

            account_identifier_hash = generate_hmac(
                HASHING_KEY, request.account_identifier
            )

            existing_tokens = fetch_entity_tokens(
                entity=entity_obj,
                account_identifier_hash=account_identifier_hash,
                platform=request.platform,
            )

            if not existing_tokens:
                return error_response(
                    context,
                    response,
                    "No token found with account "
                    f"identifier {request.account_identifier} for {request.platform}",
                    grpc.StatusCode.NOT_FOUND,
                )

            existing_tokens[0].delete_instance()

            logger.info("Successfully deleted token for %s", entity_obj.eid)

            return response(
                message="Token deleted successfully.",
                success=True,
            )

        except NotImplementedError as e:
            return error_response(
                context,
                response,
                str(e),
                grpc.StatusCode.UNIMPLEMENTED,
            )

        except Exception as e:
            return error_response(
                context,
                response,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )
