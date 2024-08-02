"""Base Logger Module."""

import os
import logging

log_level = os.getenv("LOG_LEVEL", "INFO").upper()
numeric_level = getattr(logging, log_level, None)

if not isinstance(numeric_level, int):
    raise ValueError(f"Invalid log level: {log_level}")

logging.basicConfig(
    level=numeric_level, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


def get_logger(name: str) -> logging.Logger:
    """
    Returns a configured logger instance with the specified name.

    Args:
        name (str): The name of the logger.

    Returns:
        logging.Logger: Configured logger instance.
    """
    return logging.getLogger(name)
