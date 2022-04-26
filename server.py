import logging
server_logger = logging.getLogger(__name__)
from logger import logger
logger()

from Configs import configuration

config = configuration()
api = config["API"]

from flask import Flask

from routes.user_management.v2 import v2
from controllers.sync_database import create_database, create_tables, sync_platforms

app = Flask(__name__)

create_database()
create_tables()
sync_platforms()

app.register_blueprint(v2, url_prefix="/v2")

if __name__ == "__main__":
    server_logger.info(f"Running on un-secure port: {api['PORT']}")
    app.run(host=api["HOST"], port=api["PORT"])