import logging
server_logger = logging.getLogger(__name__)
from logger import logger
logger()

from flask import Flask

from routes.v2 import v2

app = Flask(__name__)

app.register_blueprint(v2, url_prefix="/v2")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=9000)