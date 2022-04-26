import os
from configparser import ConfigParser
from error import InternalServerError

def configuration():
    config_filepath = os.path.abspath("configs/default.ini")

    if not os.path.exists(config_filepath):
        error = f"configs file not found at {config_filepath}"
        raise InternalServerError(error)

    config = ConfigParser()
    config.read(config_filepath)

    return {
        "DATABASE": config["DATABASE"],
        "API": config["API"],
        "SSL_API": config["SSL_API"]
    }
