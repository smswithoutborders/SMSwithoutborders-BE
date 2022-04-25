from flask import Blueprint

v2 = Blueprint("v2", __name__)

@v2.route("users/<user_id>/platforms/<platform>/protocols/<protocol>", methods=["POST"])
def initialize_grant():
    return