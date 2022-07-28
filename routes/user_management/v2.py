import logging
logger = logging.getLogger(__name__)

from flask import Blueprint
from flask import request
from flask import Response
from flask import jsonify

from platforms import platform_switch

from models.grants import Grant_Model
from models.platforms import Platform_Model

v2 = Blueprint("v2", __name__)

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import InternalServerError

@v2.route("users/<string:user_id>/platforms/<string:platform>/protocols/<string:protocol>/", defaults={"action": None}, methods=["POST", "PUT", "DELETE"])
@v2.route("users/<string:user_id>/platforms/<string:platform>/protocols/<string:protocol>/<string:action>", methods=["PUT"])
async def manage_grant(user_id, platform, protocol, action) -> dict:
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

        if not "first_name" in request.json or not request.json["first_name"]:
            first_name = None
        else:
            first_name = request.json["first_name"]
        
        if not "last_name" in request.json or not request.json["last_name"]:
            last_name = None
        else:
            last_name = request.json["last_name"]

        Platform = Platform_Model()
        Grant = Grant_Model()

        if method.lower() == "post":
            result = await platform_switch(
                originalUrl=originalUrl,
                platform_name=platform,
                protocol=protocol,
                method=method,
                phoneNumber=phone_number
            )

            if not "url" in result or not result["url"]:
                url = ""
            else:
                url = result["url"]

            if not "code_verifier" in result or not result["code_verifier"]:
                code_verifier = ""
            else:
                code_verifier = result["code_verifier"]

            if not "body" in result or not result["body"]:
                body = ""
            else:
                body = result["body"]

            res = jsonify({
                "url": url,
                "code_verifier": code_verifier,
                "body": body,
                "platform": platform.lower()
            })

        elif method.lower() == "put":                     
            result = await platform_switch(
                originalUrl=originalUrl,
                platform_name=platform,
                protocol=protocol,
                method=method,
                code=code,
                code_verifier=code_verifier,
                phoneNumber=phone_number,
                action=action,
                first_name=first_name,
                last_name=last_name
            )

            platform_result = Platform.find(platform_name=platform)

            Grant.store_grant(
                user_id=user_id,
                platform_id=platform_result.id,
                platform_name=platform_result.name,
                grant=result
            )

            if not "body" in result or not result["body"]:
                body = ""
            else:
                body = result["body"]

            if not "initialization_url" in result or not result["initialization_url"]:
                initialization_url = ""
            else:
                initialization_url = result["initialization_url"]
          
            res = jsonify({
                "body": body,
                "initialization_url": initialization_url
            })

        elif method.lower() == "delete":
            result = await platform_switch(
                originalUrl=originalUrl,
                platform_name=platform,
                protocol=protocol,
                method=method,
                phoneNumber=phone_number
            )
        
        return res, 200

    except BadRequest as error:
        return str(error), 400

    except InternalServerError as error:
        logger.exception(error)
        return "internal server error", 500

    except Exception as error:
        logger.exception(error)
        return "internal server error", 500