import logging
import os
import coloredlogs

from os.path import exists
from logging.handlers import TimedRotatingFileHandler


def logger():
    loglevel = os.getenv("LOG_LEVEL") or "info"
    numeric_level = getattr(logging, loglevel.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError("Invalid log level: %s" % loglevel)

    if not exists("logs/"):
        os.makedirs("logs/")

    logging.basicConfig(level=numeric_level)

    logger = logging.getLogger()
    rotatory_handler = TimedRotatingFileHandler(
        "logs/combined.log", when="D", interval=1, backupCount=30
    )
    rotatory_handler.setLevel(logging.INFO)

    coloredlogs.install(level=loglevel.upper())

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s", "%m-%d-%Y %H:%M:%S"
    )
    rotatory_handler.setFormatter(formatter)

    logger.addHandler(rotatory_handler)

    logger.info(f"Environment: {os.getenv('FLASK_ENV')}")
    logger.info(f"Log_Level: {loglevel.upper()}")
