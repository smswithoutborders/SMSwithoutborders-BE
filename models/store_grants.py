import logging
logger = logging.getLogger(__name__)

from error import BadRequest, InternalServerError, Conflict
from schemas import Wallets
import peewee as pw

def store_grant(user, platform, grant):
    platformName = platform.name.lower()

    if platformName == "gmail":
        logger.debug(f"Storing {platformName} grant for {user.id} ...")

        try:
            Wallets.create(
                user_id=user.id, 
                platform_id=platform.id,
                username=grant["profile"]["name"],
                token=grant["token"],
                uniqueId=grant["profile"]["email"],
                uniqueIdHash=grant["profile"]["email"],
                iv="iv"
            )
        except pw.IntegrityError as error:
            logger.error(f"user {user.id} already has {platformName} grant")
            raise Conflict()
        except (pw.DatabaseError) as error:
            logger.error(f"Failed storing {platformName} grant for {user.id}")
            raise InternalServerError(error)

        logger.info(f"Successfully Stored {platformName} grant for {user.id}")
    else:
        logger.error(f"invalid platform name {platformName}")
        raise BadRequest()