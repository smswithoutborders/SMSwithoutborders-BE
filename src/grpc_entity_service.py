"""GRPC Entity Service"""

import os
import logging
import base64

import grpc

import vault_pb2
import vault_pb2_grpc

from src.entity import create_entity, find_entity
from src.crypto import generate_hmac, verify_hmac
from src.otp_service import send_otp, verify_otp
from src.utils import (
    load_key,
    get_configs,
    encrypt_and_encode,
    generate_keypair_and_public_key,
    generate_crypto_metadata,
    generate_eid,
    get_shared_key,
)
from src.long_lived_token import generate_llt

HASHING_KEY = load_key(get_configs("HASHING_SALT"), 32)
KEYSTORE_PATH = get_configs("KEYSTORE_PATH")

logger = logging.getLogger(__name__)


def error_response(context, sys_msg, status_code, user_msg=None, _type=None):
    """
    Create an error response.

    Args:
        context: gRPC context.
        sys_msg (str or tuple): System message.
        status_code: gRPC status code.
        user_msg (str or tuple): User-friendly message.
        _type (str): Type of error.

    Returns:
        vault_pb2.CreateEntityResponse: Error response.
    """
    if not user_msg:
        user_msg = sys_msg

    if isinstance(user_msg, tuple):
        user_msg = "".join(user_msg)
    if isinstance(sys_msg, tuple):
        sys_msg = "".join(sys_msg)

    if _type == "UNKNOWN":
        logger.exception(sys_msg, exc_info=True)
    else:
        logger.error(sys_msg)

    context.set_details(user_msg)
    context.set_code(status_code)

    return vault_pb2.CreateEntityResponse()


def check_missing_fields(context, request, required_fields):
    """
    Check for missing fields in the gRPC request.

    Args:
        context: gRPC context.
        request: gRPC request object.
        required_fields (list): List of required fields.

    Returns:
        None or vault_pb2.CreateEntityResponse: None if no missing fields,
            error response otherwise.
    """
    missing_fields = [field for field in required_fields if not getattr(request, field)]
    if missing_fields:
        return error_response(
            context,
            f"Missing required fields: {', '.join(missing_fields)}",
            grpc.StatusCode.INVALID_ARGUMENT,
        )
    return None


def handle_pow_verification(context, request):
    """
    Handle proof of ownership verification.

    Args:
        context: gRPC context.
        request: gRPC request object.

    Returns:
        tuple: Tuple containing success flag and message.
    """
    success, message = verify_otp(
        request.phone_number, request.ownership_proof_response
    )
    if not success:
        return success, error_response(
            context,
            f"Ownership proof verification failed. Reason: {message}",
            grpc.StatusCode.UNAUTHENTICATED,
        )
    return success, message


def handle_pow_initialization(context, request):
    """
    Handle proof of ownership initialization.

    Args:
        context: gRPC context.
        request: gRPC request object.

    Returns:
        tuple: Tuple containing success flag, message, and expiration time.
    """
    success, message, expires = send_otp(request.phone_number)
    if not success:
        return success, error_response(
            context,
            f"Ownership proof initialization failed. Reason: {message}",
            grpc.StatusCode.INVALID_ARGUMENT,
        )
    return success, (message, expires)


class EntityService(vault_pb2_grpc.EntityServicer):
    """Entity Service Descriptor"""

    def CreateEntity(self, request, context):
        """Handles the creation of an entity."""

        def complete_creation(request):
            """
            Complete the creation process.

            Args:
                request: gRPC request object.

            Returns:
                vault_pb2.CreateEntityResponse: Create entity response.
            """
            success, response = handle_pow_verification(context, request)
            if not success:
                return response

            phone_number_hash = generate_hmac(HASHING_KEY, request.phone_number)
            eid = generate_eid(phone_number_hash)
            password_hash = generate_hmac(HASHING_KEY, request.password)
            country_code_ciphertext_b64 = encrypt_and_encode(request.country_code)
            server_publish_keypair, server_publish_pub_key = (
                generate_keypair_and_public_key(
                    os.path.join(KEYSTORE_PATH, f"{eid}_publish.db")
                )
            )
            server_device_id_keypair, server_device_id_pub_key = (
                generate_keypair_and_public_key(
                    os.path.join(KEYSTORE_PATH, f"{eid}_device_id.db")
                )
            )
            crypto_metadata_ciphertext_b64 = encrypt_and_encode(
                generate_crypto_metadata(
                    server_publish_keypair, server_device_id_keypair
                )
            )

            fields = {
                "eid": eid,
                "phone_number_hash": phone_number_hash,
                "password_hash": password_hash,
                "country_code": country_code_ciphertext_b64,
                "client_publish_pub_key": request.client_publish_pub_key,
                "client_device_id_pub_key": request.client_device_id_pub_key,
                "server_crypto_metadata": crypto_metadata_ciphertext_b64,
            }

            create_entity(**fields)

            shared_key = get_shared_key(
                os.path.join(KEYSTORE_PATH, f"{eid}_device_id.db"),
                server_device_id_keypair.pnt_keystore,
                server_device_id_keypair.secret_key,
                base64.b64decode(request.client_device_id_pub_key),
            )

            long_lived_token = generate_llt(eid, shared_key)

            logger.info("Entity created successfully")

            return vault_pb2.CreateEntityResponse(
                long_lived_token=long_lived_token,
                message="Entity created successfully",
                server_publish_pub_key=base64.b64encode(server_publish_pub_key).decode(
                    "utf-8"
                ),
                server_device_id_pub_key=base64.b64encode(
                    server_device_id_pub_key
                ).decode("utf-8"),
            )

        def initiate_creation(request):
            """
            Initiate the creation process.

            Args:
                request: gRPC request object.

            Returns:
                vault_pb2.CreateEntityResponse: Create entity response.
            """
            success, response = handle_pow_initialization(context, request)
            if not success:
                return response

            message, expires = response

            return vault_pb2.CreateEntityResponse(
                requires_ownership_proof=True,
                message=message,
                next_attempt_timestamp=expires,
            )

        try:
            missing_fields_response = check_missing_fields(
                context, request, ["phone_number"]
            )
            if missing_fields_response:
                return missing_fields_response

            phone_number_hash = generate_hmac(HASHING_KEY, request.phone_number)
            entity_obj = find_entity(phone_number_hash=phone_number_hash)

            if entity_obj:
                return error_response(
                    context,
                    f"Entity with phone number `{request.phone_number}` already exists.",
                    grpc.StatusCode.ALREADY_EXISTS,
                )

            if request.ownership_proof_response:
                required_fields = [
                    "country_code",
                    "password",
                    "client_publish_pub_key",
                    "client_device_id_pub_key",
                ]
                missing_fields_response = check_missing_fields(
                    context, request, required_fields
                )
                if missing_fields_response:
                    return missing_fields_response

                return complete_creation(request)

            return initiate_creation(request)

        except Exception as e:
            return error_response(
                context,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )

    def AuthenticateEntity(self, request, context):
        """Handles the authentication of an entity."""

        def initiate_authentication(request, entity_obj):
            """
            Initiate the authentication process.

            Args:
                request: gRPC request object.
                entity_obj: Entity object.

            Returns:
                vault_pb2.AuthenticateEntityResponse: Authentication response.
            """
            missing_fields_response = check_missing_fields(
                context, request, ["password"]
            )
            if missing_fields_response:
                return missing_fields_response

            if not verify_hmac(HASHING_KEY, request.password, entity_obj.password_hash):
                return error_response(
                    context,
                    f"Incorrect Password provided for phone number {request.phone_number}",
                    grpc.StatusCode.UNAUTHENTICATED,
                    user_msg=(
                        "Incorrect credentials. Please double-check ",
                        "your details and try again.",
                    ),
                )

            success, response = handle_pow_initialization(context, request)
            if not success:
                return response

            message, expires = response

            return vault_pb2.AuthenticateEntityResponse(
                requires_ownership_proof=True,
                message=message,
                next_attempt_timestamp=expires,
            )

        def complete_authentication(request, entity_obj):
            """
            Complete the authentication process.

            Args:
                request: gRPC request object.
                entity_obj: Entity object.

            Returns:
                vault_pb2.AuthenticateEntityResponse: Authentication response.
            """
            missing_fields_response = check_missing_fields(
                context,
                request,
                [
                    "client_publish_pub_key",
                    "client_device_id_pub_key",
                ],
            )
            if missing_fields_response:
                return missing_fields_response

            success, response = handle_pow_verification(context, request)
            if not success:
                return response

            eid = entity_obj.eid.hex

            server_publish_keypair, server_publish_pub_key = (
                generate_keypair_and_public_key(
                    os.path.join(KEYSTORE_PATH, f"{eid}_publish.db")
                )
            )
            server_device_id_keypair, server_device_id_pub_key = (
                generate_keypair_and_public_key(
                    os.path.join(KEYSTORE_PATH, f"{eid}_device_id.db")
                )
            )
            crypto_metadata_ciphertext_b64 = encrypt_and_encode(
                generate_crypto_metadata(
                    server_publish_keypair, server_device_id_keypair
                )
            )

            entity_obj.client_publish_pub_key = request.client_publish_pub_key
            entity_obj.client_device_id_pub_key = request.client_device_id_pub_key
            entity_obj.server_crypto_metadata = crypto_metadata_ciphertext_b64
            entity_obj.save()

            shared_key = get_shared_key(
                os.path.join(KEYSTORE_PATH, f"{eid}_device_id.db"),
                server_device_id_keypair.pnt_keystore,
                server_device_id_keypair.secret_key,
                base64.b64decode(request.client_device_id_pub_key),
            )

            long_lived_token = generate_llt(eid, shared_key)

            return vault_pb2.AuthenticateEntityResponse(
                long_lived_token=long_lived_token,
                message="Entity authenticated successfully!",
                server_publish_pub_key=base64.b64encode(server_publish_pub_key).decode(
                    "utf-8"
                ),
                server_device_id_pub_key=base64.b64encode(
                    server_device_id_pub_key
                ).decode("utf-8"),
            )

        try:
            missing_fields_response = check_missing_fields(
                context, request, ["phone_number"]
            )
            if missing_fields_response:
                return missing_fields_response

            phone_number_hash = generate_hmac(HASHING_KEY, request.phone_number)
            entity_obj = find_entity(phone_number_hash=phone_number_hash)

            if not entity_obj:
                return error_response(
                    context,
                    f"Entity with phone number `{request.phone_number}` not found.",
                    grpc.StatusCode.NOT_FOUND,
                )

            if request.ownership_proof_response:
                return complete_authentication(request, entity_obj)

            return initiate_authentication(request, entity_obj)

        except Exception as e:
            return error_response(
                context,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )
