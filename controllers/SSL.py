import os
from Configs import baseConfig

config = baseConfig()

SSL = config["SSL_API"]

def isSSL(path_crt_file: str, path_key_file: str, path_pem_file: str) -> dict:
    """
    """
    if path_crt_file == "" and path_key_file == "" and path_pem_file == "":
        return False
    else:
        if not os.path.exists(path_crt_file):
            error = "crt_file file not found at '%s'" % path_crt_file
            raise FileNotFoundError(error)
        elif not os.path.exists(path_key_file):
            error = "key_file file not found at '%s'" % path_key_file
            raise FileNotFoundError(error)
        elif not os.path.exists(path_pem_file):
            error = "pem_file file not found at '%s'" % path_pem_file
            raise FileNotFoundError(error)
        else:
            privateKey = open(SSL["KEY"], "r").read()
            certificate = open(SSL["CERTIFICATE"], "r").read()
            pem = open(SSL["PEM"], "r")
            ca = [pem.read()]

            return {"credentials": {"key": privateKey, "cert": certificate, "ca": ca}}
