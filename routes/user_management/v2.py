import logging
logger = logging.getLogger(__name__)

from flask import Blueprint, request
from platforms import platform_switch

v2 = Blueprint("v2", __name__)

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import InternalServerError

@v2.route("users/<string:user_id>/platforms/<string:platform>/protocols/<string:protocol>", methods=["POST", "PUT", "DELETE"])
def initialize_grant(user_id, platform, protocol) -> dict:
    """
    """
    try:
        originalUrl = request.host_url
        method = request.method


        if method.lower() == "post":
            result = platform_switch(originalUrl, platform, protocol, method)

        elif method.lower() == "put":
            code = request.json["code"]
                                
            result = platform_switch(originalUrl, platform, protocol, method, code=code)

        elif method.lower() == "delete":
            result = platform_switch(originalUrl, platform, protocol, method)
        
        return result

    except BadRequest as error:
        return str(error), 400

    except InternalServerError as error:
        logger.exception(error)
        return "internal server error", 500

    except Exception as error:
        logger.exception(error)
        return "internal server error", 500