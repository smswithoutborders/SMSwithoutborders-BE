import os
import logging
from configparser import ConfigParser

def baseConfig() -> dict:
    """
    """
    if os.environ.get("MODE") and os.environ.get("MODE").lower() == "production":
        logging.info("Loading production configurations ...")

        config_filepath = os.path.join(os.path.dirname(__file__), 'configs', 'production.ini')

        SSL = {
            "PORT":os.environ["SSL_PORT"],
            "CERTIFICATE":os.environ["SSL_CERTIFICATE"],
            "KEY":os.environ["SSL_KEY"],
            "PEM":os.environ["SSL_PEM"]
        }
    else:
        logging.info("Loading development configurations ...")

        config_filepath = os.path.join(os.path.dirname(__file__), 'configs', 'development.ini')

        SSL = {
            "PORT":os.environ.get("SSL_PORT"),
            "CERTIFICATE":os.environ.get("SSL_CERTIFICATE") or "",
            "KEY":os.environ.get("SSL_KEY") or "",
            "PEM":os.environ.get("SSL_PEM") or ""
        }        

    if not os.path.exists(config_filepath):
        error = "Configurations file not found at '%s'" % config_filepath
        raise FileNotFoundError(error)

    config = ConfigParser()
    config.read(config_filepath)

    DATABASE = {
        "MYSQL_HOST":os.environ.get("MYSQL_HOST"),
        "MYSQL_USER":os.environ.get("MYSQL_USER"),
        "MYSQL_PASSWORD":os.environ.get("MYSQL_PASSWORD"),
        "MYSQL_DATABASE":os.environ.get("MYSQL_DATABASE")
    }

    API = {
        "HOST":os.environ.get("HOST"),
        "PORT":os.environ.get("PORT"),
        "ORIGINS":os.environ.get("ORIGINS")
    }

    for key, value in config["API"].items():
        API[key.upper()] = value

    TWILIO = {
        "ACCOUNT_SID":os.environ.get("TWILIO_ACCOUNT_SID"),
        "AUTH_TOKEN":os.environ.get("TWILIO_AUTH_TOKEN"),
        "SERVICE_SID":os.environ.get("TWILIO_SERVICE_SID")
    }

    RECAPTCHA = {
        "ENABLE_RECAPTCHA":os.environ.get("ENABLE_RECAPTCHA") or "False",
        "SECRET_KEY":os.environ.get("RECAPTCHA_SECRET_KEY")
    }

    return {
        "DATABASE": DATABASE,
        "API": API,
        "SSL_API": SSL,
        "PLATFORMS_PATH": os.environ.get("PLATFORMS_PATH"),
        "TWILIO": TWILIO,
        "RECAPTCHA": RECAPTCHA,
        "OTP": config["OTP"]
    }
