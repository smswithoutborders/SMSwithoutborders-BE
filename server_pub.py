import logging
from logging.handlers import TimedRotatingFileHandler
import os
import argparse

from Configs import baseConfig

config = baseConfig()
api = config["API"]

parser = argparse.ArgumentParser()
parser.add_argument("--logs", help="Set log level")
args = parser.parse_args()

log_level = args.logs or "info"
numeric_level = getattr(logging, log_level.upper(), None)

if not isinstance(numeric_level, int):
    raise ValueError("Invalid log level: %s" % log_level)

if not os.path.exists("logs/"):
    os.makedirs("logs/")

logging.basicConfig(level=numeric_level)

logger = logging.getLogger()
rotatory_handler = TimedRotatingFileHandler(
    "logs/combined.log", when="D", interval=1, backupCount=30
)
rotatory_handler.setLevel(logging.INFO)
formatter = logging.Formatter(
    "%(asctime)s | %(levelname)s | %(message)s", "%m-%d-%Y %H:%M:%S"
)
rotatory_handler.setFormatter(formatter)
logger.addHandler(rotatory_handler)

from flask import Flask

from routes.publisher.v2 import v2

app = Flask(__name__)

app.register_blueprint(v2, url_prefix="/v2")

if __name__ == "__main__":
    app.logger.info("Running on un-secure port: %s" % api['PUBLISHER_PORT'])
    app.run(host=api["HOST"], port=api["PUBLISHER_PORT"])