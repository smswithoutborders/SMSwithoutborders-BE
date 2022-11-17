import logging
logger = logging.getLogger(__name__)

from peewee import DatabaseError

from src.schemas.platforms import Platforms

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import InternalServerError

PlatformObject = ()

class Platform_Model:
    def __init__(self) -> None:
        self.Platforms = Platforms

    def find(self, platform_name: str = None, platform_id: str = None) -> PlatformObject:
        """
        """
        try:
            if platform_id:
                logger.debug("Finding platform by id '%s' ..." % platform_id)

                platform = self.Platforms.get(self.Platforms.id == platform_id)

                logger.debug("- Successfully found platform '%s'" % platform_id)

                return platform

            elif platform_name:
                logger.debug("Finding platform by name '%s' ..." % platform_name)

                platform = self.Platforms.get(self.Platforms.name == platform_name)

                logger.debug("- Successfully found platform '%s'" % platform_name)

                return platform

        except self.Platforms.DoesNotExist:
            logger.error("'%s' platform not found" % platform_name)
            raise BadRequest()

        except DatabaseError as error:
            raise InternalServerError(error)