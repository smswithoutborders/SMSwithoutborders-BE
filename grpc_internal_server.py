"""Vault gRPC Internal Server"""

import logging
import os
from concurrent import futures

import grpc
from grpc_interceptor import ServerInterceptor
import vault_pb2_grpc

from settings import Configurations
from src.utils import get_configs
from src.grpc_entity_internal_service import EntityInternalService

logging.basicConfig(
    level=logging.INFO, format=("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
)
logger = logging.getLogger("[Vault gRPC Internal Server]")


class LoggingInterceptor(ServerInterceptor):
    """
    gRPC server interceptor for logging requests.
    """

    def __init__(self):
        """
        Initialize the LoggingInterceptor.
        """
        self.logger = logger
        self.terminal_width = 100

    def intercept(self, method, request_or_iterator, context, method_name):
        """
        Intercept method called for each incoming RPC.
        """
        print(f"{'[ REQUEST ]':-<{self.terminal_width}}")
        self.logger.info("%s - %s", method_name, context.peer())
        print(f"{'[ OPERATION ]':-<{self.terminal_width}}")
        response = method(request_or_iterator, context)
        print(f"{'[ RESPONSE ]':-<{self.terminal_width}}")
        if context.details():
            self.logger.error(
                "%s - %s - %s",
                str(context.code()).split(".")[1],
                method_name,
                context.peer(),
            )
        else:
            self.logger.info("%s - %s - %s", "OK", method_name, context.peer())
        return response


def serve():
    """
    Starts the gRPC internal server and listens for requests.
    """
    mode = Configurations.MODE
    server_certificate = get_configs("SSL_CERTIFICATE")
    private_key = get_configs("SSL_KEY")
    hostname = get_configs("GRPC_HOST")
    secure_port = get_configs("GRPC_INTERNAL_SSL_PORT")
    port = get_configs("GRPC_INTERNAL_PORT")

    num_cpu_cores = os.cpu_count()
    max_workers = 10

    logger.info("Starting server in %s mode...", mode)
    logger.info("Hostname: %s", hostname)
    logger.info("Insecure port: %s", port)
    logger.info("Secure port: %s", secure_port)
    logger.info("Logical CPU cores available: %s", num_cpu_cores)
    logger.info("gRPC server max workers: %s", max_workers)

    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=max_workers),
        interceptors=[LoggingInterceptor()],
    )
    vault_pb2_grpc.add_EntityInternalServicer_to_server(EntityInternalService(), server)

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
        logger.warning(
            "The server is running in insecure mode at %s:%s", hostname, port
        )

    server.start()

    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("Shutting down the server...")
        server.stop(0)
        logger.info("The server has stopped successfully")


if __name__ == "__main__":
    serve()
