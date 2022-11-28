import os

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
            privateKey = open(path_key_file, "r").read()
            certificate = open(path_crt_file, "r").read()
            pem = open(path_pem_file, "r")
            ca = [pem.read()]

            return {"credentials": {"key": privateKey, "cert": certificate, "ca": ca}}
