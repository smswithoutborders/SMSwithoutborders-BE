import logging
logger = logging.getLogger(__name__)

# configurations
from Configs import baseConfig
config = baseConfig()
api = config["API"]
cookie_name = api['COOKIE_NAME']

from flask import Blueprint
from flask import request
from flask import Response
from flask import jsonify

from platforms import platform_switch

from security.cookie import Cookie
from security.data import Data

import json
from datetime import timedelta

from models.grants import Grant_Model
from models.platforms import Platform_Model
from models.users import User_Model
from models.sessions import Session_Model

v2 = Blueprint("v2", __name__)

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import Unauthorized
from werkzeug.exceptions import InternalServerError

@v2.route("/signup", methods=["POST", "PUT"])
def signup():
    """
    """
    try:
        method = request.method

        Users = User_Model()

        if method.lower() == "post":
            if not "phone_number" in request.json or not request.json["phone_number"]:
                logger.error("no phone_number")
                raise BadRequest()
            elif not "name" in request.json or not request.json["name"]:
                logger.error("no name")
                raise BadRequest()
            elif not "country_code" in request.json or not request.json["country_code"]:
                logger.error("no country_code")
                raise BadRequest()
            elif not "password" in request.json or not request.json["password"]:
                logger.error("no password")
                raise BadRequest()

            user_agent = request.headers.get("User-Agent")

            phone_number = request.json["phone_number"]
            name = request.json["name"]
            country_code = request.json["country_code"]
            password = request.json["password"]

            user_id = Users.create(
                phone_number=phone_number,
                name=name,
                country_code=country_code,
                password=password
            )

            res = jsonify({
                "uid": user_id
            })

            Session = Session_Model()

            data = Data()

            session = Session.create(
                unique_identifier=data.hash(country_code+phone_number),
                user_agent=user_agent,
                type="signup",
            )

            cookie = Cookie()

            cookie_data = json.dumps({
                "sid": session["sid"],
                "cookie": session["data"]
            })
            e_cookie = cookie.encrypt(cookie_data)

            session_data = json.loads(session["data"])

            res.set_cookie(
                cookie_name,
                e_cookie,
                max_age=timedelta(milliseconds=session_data["maxAge"]),
                secure=session_data["secure"],
                httponly=session_data["httpOnly"],
                samesite=session_data["sameSite"]
            )

            return res, 200
                
    except BadRequest as err:
        return str(err), 400

    except Unauthorized as err:
        return str(err), 401

    except Conflict as err:
        return str(err), 409

    except InternalServerError as err:
        logger.exception(err)
        return "internal server error", 500

    except Exception as err:
        logger.exception(err)
        return "internal server error", 500

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

            if not "body" in result or not result["body"]:
                body = ""
            else:
                body = result["body"]

            if not "initialization_url" in result or not result["initialization_url"]:
                initialization_url = ""
            else:
                initialization_url = result["initialization_url"]

            if not "grant" in result or not result["grant"]:
                grant = None
            else:
                grant = result["grant"]

            platform_result = Platform.find(platform_name=platform)

            if grant:
                Grant.store(
                    user_id=user_id,
                    platform_id=platform_result.id,
                    platform_name=platform_result.name,
                    grant=grant
                )
          
            res = jsonify({
                "body": body,
                "initialization_url": initialization_url
            })

        elif method.lower() == "delete":
            platform_result = Platform.find(platform_name=platform)
            grant = Grant.find(user_id=user_id, platform_id=platform_result.id)

            result = await platform_switch(
                originalUrl=originalUrl,
                platform_name=platform,
                protocol=protocol,
                method=method,
                phoneNumber=grant.token,
                token=grant.token
            )

            Grant.delete(grant=grant)

            res = Response()
        
        return res, 200

    except BadRequest as error:
        return str(error), 400

    except Conflict as error:
        return str(error), 409

    except InternalServerError as error:
        logger.exception(error)
        return "internal server error", 500

    except Exception as error:
        logger.exception(error)
        return "internal server error", 500