import os
from configparser import ConfigParser

def baseConfig() -> dict:
    """
    """
    config_filepath = os.path.join(os.path.dirname(__file__), 'configs', 'default.ini')

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

    SSL = {
        "PORT":os.environ.get("SSL_PORT"),
        "CERTIFICATE":os.environ.get("SSL_CERTIFICATE") or "",
        "KEY":os.environ.get("SSL_KEY") or "",
        "PEM":os.environ.get("SSL_PEM") or ""
    }

    TWILIO = {
        "ACCOUNT_SID":os.environ.get("ACCOUNT_SID"),
        "AUTH_TOKEN":os.environ.get("AUTH_TOKEN"),
        "SERVICE_SID":os.environ.get("SERVICE_SID")
    }

    RECAPTCHA = {
        "ENABLE_RECAPTCHA":os.environ.get("ENABLE_RECAPTCHA"),
        "SECRET_KEY":os.environ.get("SECRET_KEY")
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
