import logging
logger = logging.getLogger(__name__)

from peewee import IntegrityError
from peewee import DatabaseError

from schemas.wallets import Wallets

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import InternalServerError

class Grant_Model:
    def __init__(self) -> None:
        self.Wallets = Wallets

    def store_grant(self, user_id: str, platform_name: str, platform_id: int, grant: dict) -> None:
        """
        """
        platformName = platform_name.lower()

        # ======================== #
        # ========= GMAIL ======== #
        # ======================== #
        if platformName == "gmail":
            logger.debug("Storing %s grant for %s ..." % (platformName, user_id))

            try:
                self.Wallets.create(
                    user_id=user_id, 
                    platform_id=platform_id,
                    username=grant["profile"]["name"],
                    token=grant["token"],
                    uniqueId=grant["profile"]["email"],
                    uniqueIdHash=grant["profile"]["email"]
                )

            except IntegrityError as error:
                logger.error("user %s already has %s grant" % (user_id, platformName))
                raise Conflict()

            except DatabaseError as error:
                logger.error("Failed storing %s grant for %s" % (platformName, user_id))
                raise InternalServerError(error)

            logger.info("- Successfully Stored %s grant for %s" % (platformName, user_id))
            
        else:
            logger.error("Invalid platform name %s" % platformName)
            raise BadRequest()