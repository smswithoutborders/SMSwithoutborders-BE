import os
from configparser import ConfigParser

def baseConfig():
    config_filepath = os.path.join(os.path.dirname(__file__), 'configs', 'default.ini')

    if not os.path.exists(config_filepath):
        error = "Configurations file not found at '%s'" % config_filepath
        raise FileNotFoundError(error)

    config = ConfigParser()
    config.read(config_filepath)

    return {
        "DATABASE": config["DATABASE"],
        "API": config["API"],
        "SSL_API": config["SSL_API"],
        "PLATFORMS": config["PLATFORMS"],
        "PLATFORMS_PATH": os.path.join(os.path.dirname(__file__), 'platforms'),
        "TWILIO": config["TWILIO"],
        "RECAPTCHA": config["RECAPTCHA"],
        "OTP": config["OTP"]
    }
