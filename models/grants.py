import logging
logger = logging.getLogger(__name__)

from peewee import IntegrityError
from peewee import DatabaseError

from schemas.wallets import Wallets

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import InternalServerError

GrantObject = ()

class Grant_Model:
    def __init__(self) -> None:
        self.Wallets = Wallets

    def store(self, user_id: str, platform_name: str, platform_id: int, grant: dict) -> None:
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
        
        # ======================== #
        # ======= TWITTER ======== #
        # ======================== #
        elif platformName == "twitter":
            logger.debug("Storing %s grant for %s ..." % (platformName, user_id))

            try:
                self.Wallets.create(
                    user_id=user_id, 
                    platform_id=platform_id,
                    username=grant["profile"]["name"],
                    token=grant["token"],
                    uniqueId=grant["profile"]["username"],
                    uniqueIdHash=grant["profile"]["username"]
                )

            except IntegrityError as error:
                logger.error("user %s already has %s grant" % (user_id, platformName))
                raise Conflict()

            except DatabaseError as error:
                logger.error("Failed storing %s grant for %s" % (platformName, user_id))
                raise InternalServerError(error)

            logger.info("- Successfully Stored %s grant for %s" % (platformName, user_id))

        # ======================== #
        # ======= TELEGRAM ======= #
        # ======================== #
        elif platformName == "telegram":
            logger.debug("Storing %s grant for %s ..." % (platformName, user_id))

            try:
                self.Wallets.create(
                    user_id=user_id, 
                    platform_id=platform_id,
                    username=grant["profile"]["first_name"],
                    token=grant["phone_number"],
                    uniqueId=grant["phone_number"],
                    uniqueIdHash=grant["phone_number"]
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

    def delete(self, grant) -> None:
        """
        """
        try:
            logger.debug("Deleteing grant ...")

            grant.delete_instance()

            logger.info("- Successfully deleted grant")

        except DatabaseError as error:
            logger.error("Failed deleting grant")
            raise InternalServerError(error)

    def find(self, user_id: str, platform_id: int) -> GrantObject:
        """
        """
        try:
            logger.debug("Finding grant user_id:%s, platform_id:%d ..." % (user_id, platform_id))

            grant = self.Wallets.get(self.Wallets.user_id == user_id, self.Wallets.platform_id == platform_id)

            logger.info("- Successfully found grant")

            return grant

        except self.Wallets.DoesNotExist:
            logger.error("Grant user_id:%s, platform_id:%d not found" % (user_id, platform_id))
            raise BadRequest()

        except DatabaseError as error:
            raise InternalServerError(error)