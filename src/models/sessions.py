import logging
logger = logging.getLogger(__name__)

from Configs import baseConfig
config = baseConfig()
api = config["API"]
developer = config["DEVELOPER"]

secure = api["SECURE_COOKIE"]
hour = eval(api["COOKIE_MAXAGE"])
dev_host = developer["HOST"]
dev_port = developer["PORT"]

from peewee import DatabaseError

from src.schemas.sessions import Sessions

import json
import requests

from datetime import datetime, timedelta

from werkzeug.exceptions import InternalServerError
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import Unauthorized
from werkzeug.exceptions import BadRequest

class Session_Model:
    def __init__(self) -> None:
        """
        """
        self.Sessions = Sessions

    def create(self, unique_identifier: str, user_agent: str, status: str = None, type: str = None) -> dict:
        """
        Create session in database.

        Arguments:
            unique_identifier: str,
            user_agent: str,
            status: str,
            type: str

        Returns:
            dict
        """
        try:
            expires = datetime.now() + timedelta(milliseconds=hour)

            data = {
                "maxAge": hour,
                "secure": eval(secure),
                "httpOnly": True,
                "sameSite": "lax",
            }

            logger.debug("Secure cookie: %s" % secure)
            logger.debug("Cookie maxAge: %s" % hour)

            logger.debug("creating session for %s ..." % unique_identifier)
            session = self.Sessions.create(
                unique_identifier=unique_identifier,
                user_agent=user_agent,
                expires=expires,
                data=json.dumps(data),
                status=status,
                type=type
            )
            logger.info(
                "- SUCCESSFULLY CREATED SESSION %s FOR %s" % (str(session), unique_identifier) 
            )

            return {
                "sid": str(session.sid),
                "uid": session.unique_identifier,
                "data": session.data,
                "type": session.type
            }

        except DatabaseError as err:
            logger.error("FAILED TO CREATE SESSION FOR %s CHECK LOGS" % unique_identifier)
            raise InternalServerError(err)

    def find(self, sid: str, unique_identifier: str, user_agent: str, cookie: str, status: str = None, type: str = None) -> str:
        """
        """
        try:
            logger.debug("finding session %s for user %s ..." % (sid, unique_identifier))

            result = []

            sessions = (
                self.Sessions.select()
                .where(
                    self.Sessions.sid == sid,
                    self.Sessions.unique_identifier == unique_identifier,
                    self.Sessions.user_agent == user_agent,
                    self.Sessions.status == status,
                    self.Sessions.type == type
                )
                .dicts()
            )

            for session in sessions:
                result.append(session)

            # check for duplicates
            if len(result) > 1:
                logger.error("Multiple sessions %s found" % sid)
                raise Conflict()

            # check for no user
            if len(result) < 1:
                logger.error("No session %s found" % sid)
                raise Unauthorized()

            expires = result[0]["expires"]
            age = expires.timestamp() - datetime.now().timestamp()

            if age <= 0:
                logger.error("Expired session %s" % sid)
                raise Unauthorized()

            if result[0]["data"] != cookie:
                logger.error("Invalid cookie data")
                logger.error('Original cokkie: %s' % result[0]["data"])
                logger.error("Invalid cokkie: %s" % cookie)
                raise Unauthorized()

            logger.info("SESSION %s FOUND" % sid)
            return str(result[0]["unique_identifier"])

        except DatabaseError as err:
            logger.error("FAILED FINDING SESSION %s CHECK LOGS" % sid)
            raise InternalServerError(err)

    def update(self, sid: str, unique_identifier: str, status: str = None, type: str = None) -> dict:
        try:
            """
            Update session in database.

            Arguments:
                sid: str,
                unique_identifier: str,
                status: str,
                type: str

            Returns:
                dict
            """

            logger.debug("finding session %s for user %s ..." % (sid, unique_identifier))

            result = []

            sessions = (
                self.Sessions.select()
                .where(
                    self.Sessions.sid == sid,
                    self.Sessions.unique_identifier == unique_identifier,
                    self.Sessions.type == type
                )
            )

            for session in sessions:
                result.append(session)

            # check for duplicates
            if len(result) > 1:
                logger.error("Multiple sessions %s found" % sid)
                raise Conflict()

            # check for no user
            if len(result) < 1:
                logger.error("No session %s found" % sid)
                raise Unauthorized()

            expires = datetime.now() + timedelta(milliseconds=hour)

            data = {
                "maxAge": hour,
                "secure": eval(secure),
                "httpOnly": True,
                "sameSite": "lax",
            }

            logger.debug(f"Secure cookie: {secure}")
            logger.debug(f"Cookie maxAge: {hour}")

            logger.debug("updating session %s for user %s ..." % (sid, unique_identifier))

            upd_session = (
                self.Sessions.update(
                    expires=expires,
                    data=json.dumps(data),
                    status=status
                )
                .where(
                    self.Sessions.sid == sid,
                    self.Sessions.unique_identifier == unique_identifier,
                    self.Sessions.type == type
                )
            )
                
            upd_session.execute()

            logger.info("- SUCCESSFULLY UPDATED SESSION %s" % sid)
            
            return {
                "sid": sid,
                "uid": unique_identifier,
                "data": json.dumps(data),
                "type": type
            }

        except DatabaseError as err:
            logger.error("FAILED UPDATING SESSION %s CHECK LOGS" % sid)
            raise InternalServerError(err)

    def authenticate(self, uid: str, user_agent: str, cookie: dict, verification_path: str) -> None:
        """
        """
        try:
            logger.debug("Authenticating developer session for %s ..." % uid)

            url = f"{dev_host}:{dev_port}/{verification_path}"
            data = {
                "uid": uid,
                "user_agent": user_agent,
                "cookie": cookie
            }

            res = requests.post(url=url, json=data)

            if res.status_code == 200:
                logger.info("- Successfully authenticated developer session")
            elif res.status_code == 400:
                logger.info("- Developer's API status code = %s" % res.status_code)
                raise BadRequest()
            elif res.status_code == 401:
                logger.info("- Developer's API status code = %s" % res.status_code)
                raise Unauthorized()
            elif res.status_code == 409:
                logger.info("- Developer's API status code = %s" % res.status_code)
                raise Conflict()
            else:
                logger.info("- Developer's API status code = %s" % res.status_code)
                raise InternalServerError()

        except BadRequest:
            raise BadRequest()
        except Unauthorized:
            raise Unauthorized()
        except Conflict:
            raise Conflict()
        except Exception as error:
            raise InternalServerError(error)

