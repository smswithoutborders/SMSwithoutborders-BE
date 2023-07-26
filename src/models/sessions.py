import logging
import json

from datetime import datetime, timedelta

from peewee import DatabaseError
from werkzeug.exceptions import Unauthorized, Conflict, InternalServerError

from settings import Configurations
from src.schemas.sessions import Sessions


logger = logging.getLogger(__name__)

secure = Configurations.SECURE_COOKIE
cookie_maxage = Configurations.COOKIE_MAXAGE
session_maxage = Configurations.SESSION_MAXAGE


class Session_Model:
    def __init__(self) -> None:
        """Session_Model constructor method that initializes the class with the following attributes:

        Attributes:
            Sessions: The `Sessions` schema object used to connect to the database.
            cookie_data (dict): A dictionary containing cookie data used to create a cookie.
        """

        self.Sessions = Sessions
        self.cookie_data = {
            "maxAge": cookie_maxage,
            "expires": str(datetime.now() + timedelta(milliseconds=cookie_maxage)),
            "secure": secure,
            "httpOnly": True,
            "sameSite": "lax",
        }

    def create(self, unique_identifier: str, user_agent: str, status: str = None, type: str = None) -> dict:
        """Creates a new session in the database.

        Args:
            unique_identifier (str): Unique identifier of the user.
            user_agent (str): User agent string of the user.
            status (str, optional): The status of the session. Defaults to None.
            type (str, optional): The type of session. Defaults to None.

        Returns:
            dict: A dictionary containing the session ID, unique identifier, cookie data, and session type.

        Raises:
            InternalServerError: If there was a database error.
        """
        try:
            expires = datetime.now() + timedelta(milliseconds=session_maxage)

            logger.debug("creating session for %s ..." % unique_identifier)

            session = self.Sessions.create(
                unique_identifier=unique_identifier,
                user_agent=user_agent,
                expires=expires,
                data=json.dumps(self.cookie_data),
                status=status,
                type=type
            )

            logger.info(
                "- SUCCESSFULLY CREATED SESSION %s FOR %s" % (
                    str(session), unique_identifier
                )
            )

            return {
                "sid": str(session.sid),
                "uid": session.unique_identifier,
                "data": session.data,
                "type": session.type
            }

        except DatabaseError as err:
            logger.error(
                "FAILED TO CREATE SESSION FOR %s CHECK LOGS" % unique_identifier
            )
            raise InternalServerError(err)

    def find(self, sid: str, unique_identifier: str, user_agent: str, cookie: str, status: str = None, type: str = None) -> str:
        """Finds a session in the database.

        Args:
            sid (str): The session ID to search for.
            unique_identifier (str): The unique identifier of the user.
            user_agent (str): The user agent string of the user.
            cookie (str): The cookie data associated with the session.
            status (str, optional): The status of the session. Defaults to None.
            type (str, optional): The type of session. Defaults to None.

        Returns:
            str: The unique identifier associated with the session.

        Raises:
            InternalServerError: If there was a database error.
            Conflict: If multiple sessions were found.
            Unauthorized: If no sessions were found or if the session was invalid.
        """
        try:
            logger.debug("finding session %s for user %s ..." %
                         (sid, unique_identifier))

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
                logger.error('Original cookie: %s' % result[0]["data"])
                logger.error("Invalid cookie: %s" % cookie)
                raise Unauthorized()

            else:
                cookie_expire = datetime.strptime(
                    json.loads(cookie)["expires"], '%Y-%m-%d %H:%M:%S.%f'
                )
                cookie_age = cookie_expire.timestamp() - datetime.now().timestamp()

                if cookie_age <= 0:
                    logger.error("Expired cookie")
                    raise Unauthorized()

            logger.info("SESSION %s FOUND" % sid)
            return str(result[0]["unique_identifier"])

        except DatabaseError as err:
            logger.error("FAILED FINDING SESSION %s CHECK LOGS" % sid)
            raise InternalServerError(err)

    def update(self, sid: str, unique_identifier: str, status: str = None, type: str = None) -> dict:
        """Updates a session in the database.

        Args:
            sid (str): The session ID to update.
            unique_identifier (str): The unique identifier of the user.
            status (str, optional): The status of the session. Defaults to None.
            type (str, optional): The type of session. Defaults to None.

        Returns:
            dict: A dictionary containing the session ID, unique identifier, cookie data, and session type.

        Raises:
            InternalServerError: If there was a database error.
        """

        try:
            logger.debug(
                "finding session %s for user %s ..." % (sid, unique_identifier)
            )

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

            logger.debug("updating session %s for user %s ..." %
                         (sid, unique_identifier))

            upd_session = (
                self.Sessions.update(
                    data=json.dumps(self.cookie_data),
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
                "data": json.dumps(self.cookie_data),
                "type": type
            }

        except DatabaseError as err:
            logger.error("FAILED UPDATING SESSION %s CHECK LOGS" % sid)
            raise InternalServerError(err)
