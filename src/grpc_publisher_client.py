"""Publisher gRPC Client"""

import logging
import json
import grpc

import publisher_pb2
import publisher_pb2_grpc

from src.utils import get_configs

logging.basicConfig(
    level=logging.INFO, format=("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
)
logger = logging.getLogger("[Publisher gRPC Client]")


def get_channel():
    """Get the appropriate gRPC channel based on the mode.

    Returns:
        grpc.Channel: The gRPC channel.
    """
    mode = get_configs("MODE", False, "development")
    hostname = get_configs("PUBLISHER_GRPC_HOST")
    port = get_configs("PUBLISHER_GRPC_PORT")
    secure_port = get_configs("PUBLISHER_GRPC_SSL_PORT")
    server_certificate = get_configs("SSL_CERTIFICATE")
    private_key = get_configs("SSL_KEY")

    logger.info("Connecting to publisher gRPC server at %s:%s", hostname, port)

    if mode == "production":
        with open(server_certificate, "rb") as cert_file, open(
            private_key, "rb"
        ) as key_file:
            credentials = grpc.ssl_channel_credentials(
                root_certificates=cert_file.read(), private_key=key_file.read()
            )
        return grpc.secure_channel(f"{hostname}:{secure_port}", credentials)

    logger.warning("Using insecure channel for gRPC communication")
    return grpc.insecure_channel(f"{hostname}:{port}")


def get_platform_creds(platform):
    """Get platform credentials based on platform name.

    Args:
        platform (str): The platform name.
    Returns:
        dict: Platform credentials.
    """
    creds_path = get_configs(f"{platform.upper()}_CREDENTIALS")

    if creds_path is None:
        raise NotImplementedError(
            f"The platform '{platform}' is currently not supported. "
            "Please contact the developers for more information on when "
            "this platform will be implemented."
        )

    oauth2_credentials = load_oauth2_credentials(creds_path)

    redirect_uris = oauth2_credentials.get("redirect_uris", [])
    redirect_uri = oauth2_credentials.get("redirect_uri", "")

    if redirect_uris:
        redirect_uri = redirect_uris[0]

    return {
        "auth_uri": oauth2_credentials.get("auth_uri", ""),
        "token_uri": oauth2_credentials.get("token_uri", ""),
        "userinfo_uri": oauth2_credentials.get("userinfo_uri", ""),
        "client_id": oauth2_credentials.get("client_id", ""),
        "client_secret": oauth2_credentials.get("client_secret", ""),
        "redirect_uri": redirect_uri,
    }


def load_oauth2_credentials(file_path):
    """
    Load OAuth2 credentials from a JSON file.

    Args:
        file_path (str): The path to the JSON file containing OAuth2 credentials.

    Returns:
        dict: OAuth2 credentials or an empty dictionary if not found.
    """

    def find_credentials_recursive(data):
        """
        Recursively search for OAuth2 credentials in a nested dictionary.

        Args:
            data (dict): The nested dictionary to search.

        Returns:
            dict: OAuth2 credentials if found, otherwise an empty dictionary.
        """
        if isinstance(data, dict):
            if "client_id" in data and "client_secret" in data:
                return data
            for value in data.values():
                credentials = find_credentials_recursive(value)
                if credentials:
                    return credentials
        return {}

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            credentials = find_credentials_recursive(data)
            if credentials:
                logger.info("Loaded OAuth2 credentials from %s", file_path)
                return credentials

            logger.warning("OAuth2 credentials not found in '%s'", file_path)
            return {}
    except FileNotFoundError:
        logger.error("OAuth2 credentials file not found: '%s'", file_path)
    except json.JSONDecodeError:
        logger.error(
            "Error decoding JSON from OAuth2 credentials file: '%s'", file_path
        )
    return {}


def exchange_oauth2_code(platform, authorization_code, code_verifier=None):
    """
    Exchange OAuth2 authorization code for access token and profile information.

    Args:
        platform (str): The platform name.
        authorization_code (str): The OAuth2 authorization code.
        code_verifier (str, optional): The OAuth2 code verifier. Defaults to None.
    Returns:
        tuple: A tuple containing the access token and profile information.
    """
    try:
        channel = get_channel()
        stub = publisher_pb2_grpc.PublisherStub(channel)

        platform_creds = get_platform_creds(platform)

        request = publisher_pb2.ExchangeOAuth2CodeRequest(
            authorization_code=authorization_code,
            code_verifier=code_verifier,
            redirect_uri=platform_creds["redirect_uri"],
            client_id=platform_creds["client_id"],
            client_secret=platform_creds["client_secret"],
            token_endpoint=platform_creds["token_uri"],
            userinfo_endpoint=platform_creds["userinfo_uri"],
        )

        logger.debug("Exchanging OAuth2 code for platform '%s'", platform)
        response = stub.ExchangeOAuth2Code(request)
        logger.info("OAuth2 code exchanged successfully for platform '%s'", platform)
        return (response, None)
    except grpc.RpcError as e:
        if e.code() == grpc.StatusCode.INVALID_ARGUMENT:
            logger.error(e)
            details = e.details()
            return (None, details)
        raise e
    except Exception as e:
        raise e
