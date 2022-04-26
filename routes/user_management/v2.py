import logging

logger = logging.getLogger(__name__)

from error import BadRequest, InternalServerError
from flask import Blueprint, request
from platforms import platform_switch

v2 = Blueprint("v2", __name__)

@v2.route("users/<user_id>/platforms/<platform>/protocols/<protocol>", methods=["POST"])
def initialize_grant(user_id, platform, protocol):
    try:
        originalUrl = request.host_url
        method = request.method
        
        result = platform_switch(originalUrl, platform, protocol, method)

        return {
            "url": result["url"]
        }
    except BadRequest as error:
        return str(error), 400
    except InternalServerError as error:
        logger.error(error)
        return "internal server error", 500
    except Exception as error:
        logger.error(error)
        return "internal server error", 500

@v2.route("users/<user_id>/platforms/<platform>/protocols/<protocol>", methods=["PUT"])
def validate_grant(user_id, platform, protocol):
    try:
        originalUrl = request.host_url
        method = request.method
        code = request.json["code"]
        
        result = platform_switch(originalUrl, platform, protocol, method, code=code)

        return result
    except BadRequest as error:
        return str(error), 400
    except InternalServerError as error:
        logger.error(error)
        return "internal server error", 500
    except Exception as error:
        logger.error(error)
        return "internal server error", 500