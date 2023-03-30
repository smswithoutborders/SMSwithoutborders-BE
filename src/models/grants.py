import logging
import json

from peewee import DatabaseError

from src.schemas.wallets import Wallets
from src.schemas.usersinfo import UsersInfos

from src.protocolHandler import OAuth2, TwoFactor

from src.security.data import Data

from src.models.broadcast import publish

from SwobThirdPartyPlatforms import ImportPlatform
from SwobThirdPartyPlatforms.exceptions import PlatformDoesNotExist

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import InternalServerError

GrantObject = ()

logger = logging.getLogger(__name__)

class Grant_Model:
    def __init__(self) -> None:
        self.Wallets = Wallets
        self.UsersInfos = UsersInfos
        self.Data = Data

    def store(self, user_id: str, platform_id: str, grant: dict) -> None:
        """
        """
        platformName = platform_id.lower()
        data = self.Data()

        logger.debug("Storing %s grant for %s ..." % (platformName, user_id))

        try:
            self.Wallets.get(self.Wallets.uniqueIdHash == data.hash(grant["profile"]["unique_id"]))

        except self.Wallets.DoesNotExist:
            try:
                self.Wallets.create(
                    userId=user_id, 
                    platformId=platform_id,
                    username=data.encrypt(grant["profile"]["name"])["e_data"],
                    token=data.encrypt(grant["token"])["e_data"],
                    uniqueId=data.encrypt(grant["profile"]["unique_id"])["e_data"],
                    uniqueIdHash=data.hash(grant["profile"]["unique_id"]),
                    iv=data.iv
                )

                logger.info("- Successfully Stored %s grant for %s" % (platformName, user_id))

            except DatabaseError as error:
                logger.error("Failed storing %s grant for %s" % (platformName, user_id))
                raise InternalServerError(error)

        else:
            logger.error("user %s already has %s grant" % (user_id, platformName))
            raise Conflict()

    def decrypt(self, grant, refresh: bool = False) -> dict:
        """
        """
        logger.debug("decrypting grant ...")

        data = self.Data()

        iv = grant.iv
        username = data.decrypt(data=grant.username, iv=iv)
        token = data.decrypt(data=grant.token, iv=iv)
        uniqueId = data.decrypt(data=grant.uniqueId, iv=iv)

        decrypted_grant = {
            "username":username,
            "token":json.loads(token),
            "uniqueId":uniqueId
        }

        logger.info("- Successfully decrypted grant")
        return decrypted_grant

    def delete(self, grant) -> None:
        """
        """
        try:
            logger.debug("Deleteing grant ...")
            
            data = self.Data()

            msisdn_hash = self.UsersInfos.get(self.UsersInfos.userId == grant.userId).full_phone_number

            grant.delete_instance()

            encrypted_data = data.encrypt(data=msisdn_hash)

            publish(body={
                "msisdn_hashed": encrypted_data["iv"] + encrypted_data["e_data"]
            })

            logger.info("- Successfully deleted grant")

        except DatabaseError as error:
            logger.error("Failed deleting grant")
            raise InternalServerError(error)

    def find(self, user_id: str, platform_id: str) -> GrantObject:
        """
        """
        try:
            logger.debug("Finding grant user_id:%s, platform_id:%s ..." % (user_id, platform_id))

            grant = self.Wallets.get(self.Wallets.userId == user_id, self.Wallets.platformId == platform_id)

            logger.info("- Successfully found grant")

            return grant

        except self.Wallets.DoesNotExist:
            logger.error("Grant user_id:%s, platform_id:%s not found" % (user_id, platform_id))
            raise BadRequest()

        except DatabaseError as error:
            raise InternalServerError(error)

    def find_all(self, user_id: str) -> GrantObject:
        """
        """
        try:
            logger.debug("Finding all grants for user_id:%s ..." % user_id)

            grant = (
                self.Wallets.select()
                .where(
                    self.Wallets.userId == user_id
                )
                .dicts()
            )

            logger.info("- Successfully found grants")

            return grant

        except DatabaseError as error:
            raise InternalServerError(error)

    def purge(self, originUrl: str, identifier: str, platform_name: str, token: str) -> None:
        """
        """
        try:
            Platform = ImportPlatform(platform_name=platform_name)
        except PlatformDoesNotExist:
            logger.error("invalid platform name: %s" % platform_name)
            raise BadRequest()  
        else:       
            Info = Platform.info
            protocol = Info["protocols"][0]

            if protocol == "oauth2":
                Protocol = OAuth2(origin=originUrl, platform_name=platform_name)
            elif protocol == "twofactor":
                Protocol = TwoFactor(identifier=identifier, platform_name=platform_name)

            Protocol.invalidation(token=token)