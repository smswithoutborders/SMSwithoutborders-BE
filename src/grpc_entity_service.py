"""gRPC Entity Service"""

import logging
import base64
import re

import grpc
import phonenumbers

import vault_pb2
import vault_pb2_grpc

from src.entity import create_entity, find_entity
from src.tokens import fetch_entity_tokens
from src.crypto import generate_hmac, verify_hmac
from src.otp_service import send_otp, verify_otp
from src.utils import (
    load_key,
    get_configs,
    encrypt_and_encode,
    generate_keypair_and_public_key,
    generate_eid,
    is_valid_x25519_public_key,
    decrypt_and_decode,
    load_keypair_object,
    clear_keystore,
)
from src.long_lived_token import generate_llt, verify_llt
from src.device_id import compute_device_id
from src.password_validation import validate_password_strength


HASHING_KEY = load_key(get_configs("HASHING_SALT"), 32)

logging.basicConfig(
    level=logging.INFO, format=("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
)
logger = logging.getLogger("[gRPC Entity Service]")


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
    invalid_fields = {}
    x25519_fields = [
        "client_publish_pub_key",
        "client_device_id_pub_key",
    ]

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

    if getattr(request, "phone_number", None) and getattr(
        request, "country_code", None
    ):
        try:
            parsed_number = phonenumbers.parse(request.phone_number)
            if (
                phonenumbers.region_code_for_country_code(parsed_number.country_code)
                != request.country_code
            ):
                expected_country = phonenumbers.region_code_for_country_code(
                    parsed_number.country_code
                )
                invalid_fields["phone_number"] = (
                    "Phone number does not match the provided country code "
                    f"{request.country_code}. Expected country code is {expected_country}"
                )
                return error_response(
                    context,
                    response,
                    f"Invalid fields: {invalid_fields}",
                    grpc.StatusCode.INVALID_ARGUMENT,
                )
        except phonenumbers.phonenumberutil.NumberParseException as e:
            match = re.split(r"\(\d\)\s*(.*)", str(e))
            invalid_fields["phone_number"] = match[1].strip()
            return error_response(
                context,
                response,
                e,
                grpc.StatusCode.INVALID_ARGUMENT,
                user_msg=f"Invalid fields: {invalid_fields}",
                _type="UNKNOWN",
            )

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


def handle_pow_verification(context, request, response):
    """
    Handle proof of ownership verification.

    Args:
        context: gRPC context.
        request: gRPC request object.
        response: gRPC response object.

    Returns:
        tuple: Tuple containing success flag and message.
    """
    success, message = verify_otp(
        request.phone_number, request.ownership_proof_response
    )
    if not success:
        return success, error_response(
            context,
            response,
            f"Ownership proof verification failed. Reason: {message}",
            grpc.StatusCode.UNAUTHENTICATED,
        )
    return success, message


def handle_pow_initialization(context, request, response):
    """
    Handle proof of ownership initialization.

    Args:
        context: gRPC context.
        request: gRPC request object.
        response: gRPC response object.

    Returns:
        tuple: Tuple containing success flag, message, and expiration time.
    """
    success, message, expires = send_otp(request.phone_number)
    if not success:
        return success, error_response(
            context,
            response,
            f"Ownership proof initialization failed. Reason: {message}",
            grpc.StatusCode.INVALID_ARGUMENT,
        )
    return success, (message, expires)


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


class EntityService(vault_pb2_grpc.EntityServicer):
    """Entity Service Descriptor"""

    def CreateEntity(self, request, context):
        """Handles the creation of an entity."""

        response = vault_pb2.CreateEntityResponse

        def complete_creation():
            success, pow_response = handle_pow_verification(context, request, response)
            if not success:
                return pow_response

            phone_number_hash = generate_hmac(HASHING_KEY, request.phone_number)
            eid = generate_eid(phone_number_hash)
            password_hash = generate_hmac(HASHING_KEY, request.password)
            country_code_ciphertext_b64 = encrypt_and_encode(request.country_code)

            clear_keystore(eid)
            entity_publish_keypair, entity_publish_pub_key = (
                generate_keypair_and_public_key(eid, "publish")
            )
            entity_device_id_keypair, entity_device_id_pub_key = (
                generate_keypair_and_public_key(eid, "device_id")
            )

            device_id_shared_key = entity_device_id_keypair.agree(
                base64.b64decode(request.client_device_id_pub_key)
            )

            long_lived_token = generate_llt(eid, device_id_shared_key)

            fields = {
                "eid": eid,
                "phone_number_hash": phone_number_hash,
                "password_hash": password_hash,
                "country_code": country_code_ciphertext_b64,
                "device_id": compute_device_id(
                    device_id_shared_key,
                    request.phone_number,
                    request.client_device_id_pub_key,
                ),
                "client_publish_pub_key": request.client_publish_pub_key,
                "client_device_id_pub_key": request.client_device_id_pub_key,
                "publish_keypair": entity_publish_keypair.serialize(),
                "device_id_keypair": entity_device_id_keypair.serialize(),
            }

            create_entity(**fields)

            logger.info("Entity created successfully")

            return response(
                long_lived_token=long_lived_token,
                message="Entity created successfully",
                server_publish_pub_key=base64.b64encode(entity_publish_pub_key).decode(
                    "utf-8"
                ),
                server_device_id_pub_key=base64.b64encode(
                    entity_device_id_pub_key
                ).decode("utf-8"),
            )

        def initiate_creation():
            success, pow_response = handle_pow_initialization(
                context, request, response
            )
            if not success:
                return pow_response

            message, expires = pow_response

            return response(
                requires_ownership_proof=True,
                message=message,
                next_attempt_timestamp=expires,
            )

        def validate_fields():
            invalid_fields = validate_request_fields(
                context,
                request,
                response,
                [
                    "phone_number",
                    "country_code",
                    "password",
                    "client_publish_pub_key",
                    "client_device_id_pub_key",
                ],
            )
            if invalid_fields:
                return invalid_fields

            invalid_password = validate_password_strength(request.password)
            if invalid_password:
                return error_response(
                    context,
                    response,
                    f"Invalid fields: {invalid_password}",
                    grpc.StatusCode.INVALID_ARGUMENT,
                )

            return None

        try:
            invalid_fields_response = validate_fields()
            if invalid_fields_response:
                return invalid_fields_response

            phone_number_hash = generate_hmac(HASHING_KEY, request.phone_number)
            entity_obj = find_entity(phone_number_hash=phone_number_hash)

            if entity_obj:
                return error_response(
                    context,
                    response,
                    f"Entity with phone number `{request.phone_number}` already exists.",
                    grpc.StatusCode.ALREADY_EXISTS,
                )

            if request.ownership_proof_response:
                return complete_creation()

            return initiate_creation()

        except Exception as e:
            return error_response(
                context,
                response,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )

    def AuthenticateEntity(self, request, context):
        """Handles the authentication of an entity."""

        response = vault_pb2.AuthenticateEntityResponse

        def initiate_authentication(entity_obj):
            if not verify_hmac(HASHING_KEY, request.password, entity_obj.password_hash):
                return error_response(
                    context,
                    response,
                    f"Incorrect Password provided for phone number {request.phone_number}",
                    grpc.StatusCode.UNAUTHENTICATED,
                    user_msg=(
                        "Incorrect credentials. Please double-check "
                        "your details and try again."
                    ),
                )

            success, pow_response = handle_pow_initialization(
                context, request, response
            )
            if not success:
                return pow_response

            message, expires = pow_response
            entity_obj.device_id = None
            entity_obj.server_state = None
            entity_obj.save()

            return response(
                requires_ownership_proof=True,
                message=message,
                next_attempt_timestamp=expires,
            )

        def complete_authentication(entity_obj):
            success, pow_response = handle_pow_verification(context, request, response)
            if not success:
                return pow_response

            eid = entity_obj.eid.hex

            clear_keystore(eid)
            entity_publish_keypair, entity_publish_pub_key = (
                generate_keypair_and_public_key(eid, "publish")
            )
            entity_device_id_keypair, entity_device_id_pub_key = (
                generate_keypair_and_public_key(eid, "device_id")
            )

            device_id_shared_key = entity_device_id_keypair.agree(
                base64.b64decode(request.client_device_id_pub_key)
            )

            long_lived_token = generate_llt(eid, device_id_shared_key)

            entity_obj.device_id = compute_device_id(
                device_id_shared_key,
                request.phone_number,
                request.client_device_id_pub_key,
            )
            entity_obj.client_publish_pub_key = request.client_publish_pub_key
            entity_obj.client_device_id_pub_key = request.client_device_id_pub_key
            entity_obj.publish_keypair = entity_publish_keypair.serialize()
            entity_obj.device_id_keypair = entity_device_id_keypair.serialize()
            entity_obj.save()

            return response(
                long_lived_token=long_lived_token,
                message="Entity authenticated successfully!",
                server_publish_pub_key=base64.b64encode(entity_publish_pub_key).decode(
                    "utf-8"
                ),
                server_device_id_pub_key=base64.b64encode(
                    entity_device_id_pub_key
                ).decode("utf-8"),
            )

        def validate_fields():
            return validate_request_fields(
                context,
                request,
                response,
                [
                    "phone_number",
                    "password",
                    "client_publish_pub_key",
                    "client_device_id_pub_key",
                ],
            )

        try:
            invalid_fields_response = validate_fields()
            if invalid_fields_response:
                return invalid_fields_response

            phone_number_hash = generate_hmac(HASHING_KEY, request.phone_number)
            entity_obj = find_entity(phone_number_hash=phone_number_hash)

            if not entity_obj:
                return error_response(
                    context,
                    response,
                    f"Entity with phone number `{request.phone_number}` not found.",
                    grpc.StatusCode.NOT_FOUND,
                )

            if request.ownership_proof_response:
                return complete_authentication(entity_obj)

            return initiate_authentication(entity_obj)

        except Exception as e:
            return error_response(
                context,
                response,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )

    def ListEntityStoredTokens(self, request, context):
        """Handles listing an entity's stored tokens."""

        response = vault_pb2.ListEntityStoredTokensResponse

        try:
            invalid_fields_response = validate_request_fields(
                context, request, response, ["long_lived_token"]
            )
            if invalid_fields_response:
                return invalid_fields_response

            entity_obj, llt_error_response = verify_long_lived_token(
                request, context, response
            )
            if llt_error_response:
                return llt_error_response

            tokens = fetch_entity_tokens(
                entity=entity_obj,
                fetch_all=True,
                fields=["account_identifier", "platform"],
                return_json=True,
            )
            for token in tokens:
                for field in ["account_identifier"]:
                    if field in token:
                        token[field] = decrypt_and_decode(token[field])

            logger.info("Successfully retrieved tokens for %s", entity_obj.eid)
            return response(
                stored_tokens=tokens, message="Tokens retrieved successfully."
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

    def DeleteEntity(self, request, context):
        """Handles deleting an entity"""

        response = vault_pb2.DeleteEntityResponse

        def validate_fields():
            return validate_request_fields(
                context, request, response, ["long_lived_token"]
            )

        def fetch_stored_tokens(entity_obj):
            stored_tokens = fetch_entity_tokens(
                entity=entity_obj,
                fetch_all=True,
                fields=["account_identifier", "platform"],
                return_json=True,
            )
            for token in stored_tokens:
                for field in ["account_identifier"]:
                    if field in token:
                        token[field] = decrypt_and_decode(token[field])

            if stored_tokens:
                token_info = [
                    {
                        "account_identifier": token.get("account_identifier"),
                        "platform": token.get("platform"),
                    }
                    for token in stored_tokens
                ]

                token_details = "; ".join(
                    str(
                        {
                            "account_identifier": token["account_identifier"],
                            "platform": token["platform"],
                        }
                    )
                    for token in token_info
                )

                return error_response(
                    context,
                    response,
                    f"You cannot delete entity because it still has stored tokens. "
                    f"Revoke stored tokens with the following platforms and try again: "
                    f"{token_details}.",
                    grpc.StatusCode.FAILED_PRECONDITION,
                )

            return None

        try:
            invalid_fields_response = validate_fields()
            if invalid_fields_response:
                return invalid_fields_response

            entity_obj, llt_error_response = verify_long_lived_token(
                request, context, response
            )
            if llt_error_response:
                return llt_error_response

            stored_tokens = fetch_stored_tokens(entity_obj)
            if stored_tokens:
                return stored_tokens

            entity_obj.delete_instance()
            clear_keystore(entity_obj.eid.hex)

            logger.info("Successfully deleted entity %s", entity_obj.eid)

            return response(
                message="Entity deleted successfully.",
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

    def ResetPassword(self, request, context):
        """Handles resetting an entity's password."""

        response = vault_pb2.ResetPasswordResponse

        def initiate_reset(entity_obj):
            success, pow_response = handle_pow_initialization(
                context, request, response
            )
            if not success:
                return pow_response

            message, expires = pow_response
            entity_obj.device_id = None
            entity_obj.server_state = None
            entity_obj.save()

            return response(
                requires_ownership_proof=True,
                message=message,
                next_attempt_timestamp=expires,
            )

        def complete_reset(entity_obj):
            success, pow_response = handle_pow_verification(context, request, response)
            if not success:
                return pow_response

            eid = entity_obj.eid.hex
            password_hash = generate_hmac(HASHING_KEY, request.new_password)

            clear_keystore(eid)
            entity_publish_keypair, entity_publish_pub_key = (
                generate_keypair_and_public_key(eid, "publish")
            )
            entity_device_id_keypair, entity_device_id_pub_key = (
                generate_keypair_and_public_key(eid, "device_id")
            )

            device_id_shared_key = entity_device_id_keypair.agree(
                base64.b64decode(request.client_device_id_pub_key)
            )

            long_lived_token = generate_llt(eid, device_id_shared_key)

            entity_obj.password_hash = password_hash
            entity_obj.device_id = compute_device_id(
                device_id_shared_key,
                request.phone_number,
                request.client_device_id_pub_key,
            )
            entity_obj.client_publish_pub_key = request.client_publish_pub_key
            entity_obj.client_device_id_pub_key = request.client_device_id_pub_key
            entity_obj.publish_keypair = entity_publish_keypair.serialize()
            entity_obj.device_id_keypair = entity_device_id_keypair.serialize()
            entity_obj.save()

            return response(
                long_lived_token=long_lived_token,
                message="Password reset successfully!",
                server_publish_pub_key=base64.b64encode(entity_publish_pub_key).decode(
                    "utf-8"
                ),
                server_device_id_pub_key=base64.b64encode(
                    entity_device_id_pub_key
                ).decode("utf-8"),
            )

        def validate_fields():
            invalid_fields = validate_request_fields(
                context,
                request,
                response,
                [
                    "phone_number",
                    "new_password",
                    "client_publish_pub_key",
                    "client_device_id_pub_key",
                ],
            )
            if invalid_fields:
                return invalid_fields

            invalid_password = validate_password_strength(request.new_password)
            if invalid_password:
                return error_response(
                    context,
                    response,
                    f"Invalid fields: {invalid_password}",
                    grpc.StatusCode.INVALID_ARGUMENT,
                )

            return None

        try:
            invalid_fields_response = validate_fields()
            if invalid_fields_response:
                return invalid_fields_response

            phone_number_hash = generate_hmac(HASHING_KEY, request.phone_number)
            entity_obj = find_entity(phone_number_hash=phone_number_hash)

            if not entity_obj:
                return error_response(
                    context,
                    response,
                    f"Entity with phone number `{request.phone_number}` not found.",
                    grpc.StatusCode.NOT_FOUND,
                )

            if request.ownership_proof_response:
                return complete_reset(entity_obj)

            return initiate_reset(entity_obj)

        except Exception as e:
            return error_response(
                context,
                response,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )

    def UpdateEntityPassword(self, request, context):
        """Handles changing an entity's password."""

        response = vault_pb2.UpdateEntityPasswordResponse
