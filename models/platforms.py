import logging
logger = logging.getLogger(__name__)

from peewee import DatabaseError

from schemas.platforms import Platforms

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import InternalServerError

PlatformObject = ()

class Platform_Model:
    def __init__(self) -> None:
        self.Platforms = Platforms

    def find(self, platform_name: str) -> PlatformObject:
        """
        """
        try:
            logger.debug("Finding platform by name '%s' ..." % platform_name)

            platform = self.Platforms.get(Platforms.name == platform_name)

            logger.debug("- Successfully found platform '%s'" % platform_name)

            return platform

        except self.Platforms.DoesNotExist:
            logger.error("'%s' platform not found" % platform_name)
            raise BadRequest()

        except DatabaseError as error:
            raise InternalServerError(error)