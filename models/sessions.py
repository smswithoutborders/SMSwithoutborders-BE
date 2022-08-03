import logging
logger = logging.getLogger(__name__)

from Configs import baseConfig
config = baseConfig()
api = config["API"]
secure = api["SECURE_COOKIE"]
hour = eval(api["COOKIE_MAXAGE"])

from peewee import DatabaseError

from schemas.sessions import Sessions

from uuid import uuid4
from datetime import datetime, timedelta

from werkzeug.exceptions import InternalServerError
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import Unauthorized

class Session_Model:
    def __init__(self) -> None:
        """
        """
        self.Sessions = Sessions

    def create(self, unique_identifier: str, user_agent: str) -> dict:
        """
        Create session in database.

        Arguments:
            unique_identifier: str,
            user_agent: str

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
                sid=uuid4(),
                unique_identifier=unique_identifier,
                user_agent=user_agent,
                expires=expires,
                data=str(data),
                createdAt=datetime.now(),
            )
            logger.info(
                "- SUCCESSFULLY CREATED SESSION %s FOR %s" % (str(session), unique_identifier) 
            )
            return {"sid": str(session), "uid": unique_identifier, "data": data}

        except DatabaseError as err:
            logger.error("FAILED TO CREATE SESSION FOR %s CHECK LOGS" % unique_identifier)
            raise InternalServerError(err) from None

    def find(self, sid: str, unique_identifier: str, user_agent: str, cookie: dict) -> int:
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

            str_cookie = str(cookie)
            str_cookie = str_cookie.replace(": 'False'", ": False")
            str_cookie = str_cookie.replace(": 'True'", ": True")

            if result[0]["data"] != str_cookie:
                logger.error("Invalid cookie data")
                logger.error('Original cokkie: %s' % result[0]["data"])
                logger.error("Invalid cokkie: %s" % str_cookie)
                raise Unauthorized()

            logger.info("SESSION %s FOUND" % sid)
            return int(result[0]["unique_identifier"])

        except DatabaseError as err:
            logger.error("FAILED FINDING SESSION %s CHECK LOGS" % sid)
            raise InternalServerError(err) from None

    def update(self, sid: str, unique_identifier: str) -> dict:
        try:
            """
            Update session in database.

            Arguments:
                sid: str,
                unique_identifier: str

            Returns:
                dict
            """
            expires = datetime.now() + timedelta(milliseconds=hour)

            data = {
                "maxAge": hour,
                "secure": eval(secure),
                "httpOnly": True,
                "sameSite": "lax",
            }

            logger.debug(f"Secure cookie: {secure}")
            logger.debug(f"Cookie maxAge: {hour}")

            logger.debug("finding session %s for user %s ..." % (sid, unique_identifier))

            result = []

            sessions = (
                self.Sessions.select()
                .where(
                    self.Sessions.sid == sid,
                    self.Sessions.unique_identifier == unique_identifier
                ).dicts()
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

            logger.debug("updating session %s for user %s ..." % (sid, unique_identifier))
            upd_session = self.Sessions.update(expires=expires, data=str(data)).where(
                self.Sessions.sid == sid
            )
            upd_session.execute()

            logger.info("- SUCCESSFULLY UPDATED SESSION %s" % sid)
            return {"sid": sid, "uid": unique_identifier, "data": data}

        except DatabaseError as err:
            logger.error("FAILED UPDATING SESSION %s CHECK LOGS" % sid)
            raise InternalServerError(err) from None

