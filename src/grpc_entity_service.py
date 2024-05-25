"""GRPC Entity Service"""

import os
import logging
import json
import base64

import grpc

from smswithoutborders_libsig.keypairs import x25519

import vault_pb2
import vault_pb2_grpc

from src.entity import create_entity, find_entity
from src.crypto import generate_hmac, encrypt_aes
from src.otp_service import send_otp, verify_otp
from src.utils import load_key

from settings import Configurations

HASHING_KEY = load_key(Configurations.HASHING_SALT, 32)
ENCRYPTION_KEY = load_key(Configurations.SHARED_KEY, 32)

logger = logging.getLogger(__name__)


def error_response(context, sys_msg, status_code, user_msg=None, _type=None):
    if not user_msg:
        user_msg = sys_msg

    if _type == "UNKNOWN":
        logger.exception(sys_msg, exc_info=True)
    else:
        logger.error(sys_msg)

    context.set_details(user_msg)
    context.set_code(status_code)

    return vault_pb2.CreateEntityResponse()


def check_missing_fields(context, request, required_fields):
    missing_fields = [field for field in required_fields if not getattr(request, field)]
    if missing_fields:
        return error_response(
            context,
            f"Missing required fields: {', '.join(missing_fields)}",
            grpc.StatusCode.INVALID_ARGUMENT,
        )
    return None


def handle_pow_verification(context, request):
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

        def create_entity_with_ownership_proof(request):
            success, response = handle_pow_verification(context, request)
            if not success:
                return response

            phone_number_hash = generate_hmac(HASHING_KEY, request.phone_number)
            eid = generate_hmac(HASHING_KEY, phone_number_hash)
            password_hash = generate_hmac(HASHING_KEY, request.password)

            country_code_ciphertext_b64 = base64.b64encode(
                encrypt_aes(ENCRYPTION_KEY, request.country_code)
            ).decode("utf-8")
            username_ciphertext_b64 = (
                base64.b64encode(encrypt_aes(ENCRYPTION_KEY, request.username)).decode(
                    "utf-8"
                )
                if request.username
                else None
            )

            entity_keystore_path = os.path.join(
                Configurations.KEYSTORE_PATH, f"{eid}.db"
            )
            entity_keypair_obj = x25519(entity_keystore_path)
            peer_publish_pub_key = entity_keypair_obj.init()
            entity_pnt_keystore = entity_keypair_obj.pnt_keystore
            entity_secret_key = entity_keypair_obj.secret_key

            crypto_metadata_ciphertext_b64 = base64.b64encode(
                encrypt_aes(
                    ENCRYPTION_KEY,
                    json.dumps(
                        {
                            "pnt_keystore": entity_pnt_keystore,
                            "secret_key": entity_secret_key,
                        }
                    ),
                )
            ).decode("utf-8")

            fields = {
                "eid": eid,
                "phone_number_hash": phone_number_hash,
                "password_hash": password_hash,
                "country_code": country_code_ciphertext_b64,
                "username": username_ciphertext_b64,
                "publish_pub_key": request.publish_pub_key,
                "device_id_pub_key": request.device_id_pub_key,
                "crypto_metadata": crypto_metadata_ciphertext_b64,
            }

            create_entity(**fields)
            logger.info("Entity created successfully")

            return vault_pb2.CreateEntityResponse(
                message="Entity created successfully",
                peer_publish_pub_key=base64.b64encode(peer_publish_pub_key).decode(
                    "utf-8"
                ),
            )

        def create_entity_without_ownership_proof(request):
            success, response = handle_pow_initialization(context, request)
            if not success:
                return response

            message, expires = response

            return vault_pb2.CreateEntityResponse(
                requires_ownership_proof=True, message=message, next_attempt=expires
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
                    "publish_pub_key",
                    "device_id_pub_key",
                ]
                missing_fields_response = check_missing_fields(
                    context, request, required_fields
                )
                if missing_fields_response:
                    return missing_fields_response

                return create_entity_with_ownership_proof(request)

            return create_entity_without_ownership_proof(request)

        except Exception as e:
            return error_response(
                context,
                e,
                grpc.StatusCode.INTERNAL,
                user_msg="Oops! Something went wrong. Please try again later.",
                _type="UNKNOWN",
            )
