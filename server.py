import logging
import argparse
import ssl
import os

from utils.SSL import isSSL
from Configs import baseConfig

config = baseConfig()
api = config["API"]
SSL = config["SSL_API"]
DATABASE = config["DATABASE"]

from flask import Flask
from flask import send_from_directory
from flask_cors import CORS

from src.api_v2 import v2

app = Flask(__name__)

CORS(
    app,
    origins=api["ORIGINS"],
    supports_credentials=True,
)

app.register_blueprint(v2, url_prefix="/v2")

@app.route('/public/<path:path>')
def send_report(path):
    return send_from_directory('logos', path)

checkSSL = isSSL(path_crt_file=SSL["CERTIFICATE"], path_key_file=SSL["KEY"], path_pem_file=SSL["PEM"])

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
        context.load_cert_chain(SSL["CERTIFICATE"], SSL["KEY"])

        app.logger.info("Running on secure port: %s" % SSL['PORT'])
        app.run(host=api["HOST"], port=SSL["PORT"], ssl_context=context)
    else:
        app.logger.info("Running on un-secure port: %s" % api['PORT'])
        app.run(host=api["HOST"], port=api["PORT"])