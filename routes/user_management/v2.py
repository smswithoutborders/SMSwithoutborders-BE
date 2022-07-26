import logging
logger = logging.getLogger(__name__)

from flask import Blueprint, request
from platforms import platform_switch

v2 = Blueprint("v2", __name__)

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import InternalServerError

@v2.route("users/<string:user_id>/platforms/<string:platform>/protocols/<string:protocol>", methods=["POST", "PUT", "DELETE"])
async def manage_grant(user_id, platform, protocol) -> dict:
    """
    """
    try:
        originalUrl = request.host_url
        method = request.method

        if not "code" in request.json or not request.json["code"]:
            code = None
        else:
            code = request.json["code"]
        
        if not "phone_number" in request.json or not request.json["phone_number"]:
            phone_number = None
        else:
            phone_number = request.json["phone_number"]

        if not "code_verifier" in request.json or not request.json["code_verifier"]:
            code_verifier = None
        else:
            code_verifier = request.json["code_verifier"]

        if method.lower() == "post":
            result = await platform_switch(originalUrl=originalUrl, platform_name=platform, protocol=protocol, method=method, phoneNumber=phone_number)

        elif method.lower() == "put":                     
            result = await platform_switch(originalUrl=originalUrl, platform_name=platform, protocol=protocol, method=method, code=code, code_verifier=code_verifier, phoneNumber=phone_number)

        elif method.lower() == "delete":
            result = await platform_switch(originalUrl=originalUrl, platform_name=platform, protocol=protocol, method=method, phoneNumber=phone_number)
        
        return result, 200

    except BadRequest as error:
        return str(error), 400

    except InternalServerError as error:
        logger.exception(error)
        return "internal server error", 500

    except Exception as error:
        logger.exception(error)
        return "internal server error", 500