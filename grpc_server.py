"""Vault gRPC server"""

import logging
import os
from concurrent import futures

import grpc
import vault_pb2_grpc

from settings import Configurations
from src.utils import get_configs
from src.grpc_entity_service import EntityService

logger = logging.getLogger("[GRPC SERVER]")


def serve():
    """
    Starts the gRPC server and listens for requests.
    """
    mode = Configurations.MODE
    server_certificate = get_configs("SSL_CERTIFICATE")
    private_key = get_configs("SSL_KEY")
    hostname = get_configs("GRPC_HOST")
    secure_port = get_configs("GRPC_SSL_PORT")
    port = get_configs("GRPC_PORT")

    num_cpu_cores = os.cpu_count()
    max_workers = 10

    logger.info("Starting server in %s mode...", mode)
    logger.info("Hostname: %s", hostname)
    logger.info("Insecure port: %s", port)
    logger.info("Secure port: %s", secure_port)
    logger.info("Logical CPU cores available: %s", num_cpu_cores)
    logger.info("gRPC server max workers: %s", max_workers)

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=max_workers))
    vault_pb2_grpc.add_EntityServicer_to_server(EntityService(), server)

    if mode == "production":
        try:
            with open(server_certificate, "rb") as f:
                server_certificate_data = f.read()
            with open(private_key, "rb") as f:
                private_key_data = f.read()

            server_credentials = grpc.ssl_server_credentials(
                ((private_key_data, server_certificate_data),)
            )
            server.add_secure_port(f"{hostname}:{secure_port}", server_credentials)
            logger.info(
                "TLS is enabled: The server is securely running at %s:%s",
                hostname,
                secure_port,
            )
        except FileNotFoundError as e:
            logger.critical(
                (
                    "Unable to start server: TLS certificate or key file not found: %s. "
                    "Please check your configuration."
                ),
                e,
            )
            raise
        except Exception as e:
            logger.critical(
                (
                    "Unable to start server: Error loading TLS credentials: %s. ",
                    "Please check your configuration.",
                ),
                e,
            )
            raise
    else:
        server.add_insecure_port(f"{hostname}:{port}")
        logger.info("The server is running in insecure mode at %s:%s", hostname, port)

    server.start()

    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("Shutting down the server...")
        server.stop(0)
        logger.info("The server has stopped successfully")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    serve()
