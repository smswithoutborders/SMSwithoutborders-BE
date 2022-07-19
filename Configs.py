import os
from configparser import ConfigParser

def configuration():
    config_filepath = os.path.abspath("configs/default.ini")

    if not os.path.exists(config_filepath):
        error = "configs file not found at %s" % config_filepath
        raise FileNotFoundError(error)

    config = ConfigParser()
    config.read(config_filepath)

    return {
        "DATABASE": config["DATABASE"],
        "API": config["API"],
        "SSL_API": config["SSL_API"],
        "PLATFORMS": config["PLATFORMS"]
    }
