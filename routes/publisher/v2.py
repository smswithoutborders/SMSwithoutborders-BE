import logging
logger = logging.getLogger(__name__)

# configurations
from Configs import baseConfig
config = baseConfig()
api = config["API"]
cookie_name = api['COOKIE_NAME']
dev_cookie_name = api['DEV_COOKIE_NAME']
enable_otp_counter = eval(config["OTP"]["ENABLE"])

from flask import Blueprint
from flask import request
from flask import Response
from flask import jsonify

from platforms import platform_switch

from security.cookie import Cookie
from security.data import Data

import json
import base64

from datetime import datetime
from datetime import timedelta

from models.grants import Grant_Model
from models.platforms import Platform_Model
from models.users import User_Model
from models.sessions import Session_Model
from models._2FA import OTP_Model

v2 = Blueprint("v2", __name__)

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import Unauthorized
from werkzeug.exceptions import Forbidden
from werkzeug.exceptions import InternalServerError
from werkzeug.exceptions import TooManyRequests

@v2.route("/decrypt", methods=["POST"])
def decrypt():
    """
    """
    try:
        User = User_Model()
        Session = Session_Model()
        Grant = Grant_Model()
        Platform = Platform_Model()

        if not request.cookies.get(dev_cookie_name):
            logger.error("no dev cookie")
            raise Unauthorized()
        elif not request.headers.get("User-Agent"):
            logger.error("no user agent")
            raise BadRequest()
        elif not "phone_number" in request.json or not request.json["phone_number"]:
            logger.error("no phone_number")
            raise BadRequest()
        elif not "platform" in request.json or not request.json["platform"]:
            logger.error("no platform")
            raise BadRequest()

        dev_cookie = json.loads(base64.b64decode(request.cookies.get(dev_cookie_name)))
        user_agent = request.headers.get("User-Agent")
        dev_uid = dev_cookie["uid"]
        dev_user_agent = dev_cookie["userAgent"]
        dev_verification_path = dev_cookie["verification_path"]

        phone_number = request.json["phone_number"]
        platform_name = request.json["platform"]

        Session.authenticate(
            uid=dev_uid,
            user_agent=dev_user_agent,
            cookie=dev_cookie["cookie"],
            verification_path=dev_verification_path
        )
    
        user = User.find(phone_number=phone_number)
        platform = Platform.find(platform_name=platform_name)
        
        try:
            grant = Grant.find(user_id=user["userId"], platform_id=platform.id)
            d_grant = Grant.decrypt(platform_name=platform.name, grant=grant, refresh=True)
        except BadRequest:
            d_grant = []

        res = jsonify(d_grant)

        Session.create(
            unique_identifier=user["userId"],
            user_agent=user_agent,
            type="publisher"
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

@v2.route("/whoami", methods=["POST"])
def whoami():
    """
    """
    try:
        User = User_Model()
        Session = Session_Model()

        if not request.cookies.get(dev_cookie_name):
            logger.error("no dev cookie")
            raise Unauthorized()
        elif not request.headers.get("User-Agent"):
            logger.error("no user agent")
            raise BadRequest()
        elif not "phone_number" in request.json or not request.json["phone_number"]:
            logger.error("no phone_number")
            raise BadRequest()

        dev_cookie = json.loads(base64.b64decode(request.cookies.get(dev_cookie_name)))
        user_agent = request.headers.get("User-Agent")
        dev_uid = dev_cookie["uid"]
        dev_user_agent = dev_cookie["userAgent"]
        dev_verification_path = dev_cookie["verification_path"]

        phone_number = request.json["phone_number"]

        Session.authenticate(
            uid=dev_uid,
            user_agent=dev_user_agent,
            cookie=dev_cookie["cookie"],
            verification_path=dev_verification_path
        )
    
        user = User.find(phone_number=phone_number)

        res = jsonify({
            "user_id": user["userId"]
        })

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

