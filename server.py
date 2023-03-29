import logging
import argparse
import os
import ssl
import json

from utils.SSL import isSSL

from settings import Configurations
ssl_cert = Configurations.SSL_CERTIFICATE
ssl_port = Configurations.SSL_PORT
ssl_key = Configurations.SSL_KEY
ssl_pem = Configurations.SSL_PEM
api_host = Configurations.HOST
api_port = Configurations.PORT
api_origins = Configurations.ORIGINS

from flask import Flask
from flask import send_from_directory
from flask_cors import CORS

from src.api_v2 import v2

from SwobThirdPartyPlatforms import base_dir

app = Flask(__name__)

CORS(
    app,
    origins=json.loads(api_origins),
    supports_credentials=True,
)

app.register_blueprint(v2, url_prefix="/v2")

@app.route('/public/<path:path>')
def send_report(path):
    platform_name = path.split("-")[0]
    logo_path = os.path.join(base_dir, platform_name)
    return send_from_directory(logo_path, path)

checkSSL = isSSL(path_crt_file=ssl_cert, path_key_file=ssl_key, path_pem_file=ssl_pem)

if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("--logs", help="Set log level")
    args = parser.parse_args()

    log_level = args.logs or "info"
    numeric_level = getattr(logging, log_level.upper(), None)

    if not isinstance(numeric_level, int):
        raise ValueError("Invalid log level: %s" % log_level)

    logging.basicConfig(level=numeric_level)

    if checkSSL:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(ssl_cert, ssl_key)

        app.logger.info("Running on secure port: %s" % ssl_port)
        app.run(host=api_host, port=ssl_port, ssl_context=context)
    else:
        app.logger.info("Running on un-secure port: %s" % api_port)
        app.run(host=api_host, port=api_port)