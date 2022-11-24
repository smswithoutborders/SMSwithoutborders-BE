import logging
import os

from Configs import baseConfig
config = baseConfig()
platforms_path = config["PLATFORMS_PATH"]

import importlib.util       
import json

from peewee import IntegrityError
from peewee import DatabaseError

from src.schemas.wallets import Wallets

from src.protocolHandler import OAuth2, TwoFactor

from src.security.data import Data

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
        self.Data = Data

    def store(self, user_id: str, platform_id: str, grant: dict) -> None:
        """
        """
        platformName = platform_id.lower()
        data = self.Data()

        logger.debug("Storing %s grant for %s ..." % (platformName, user_id))

        try:
            self.Wallets.create(
                userId=user_id, 
                platformId=platform_id,
                username=data.encrypt(json.dumps(grant["profile"]["name"]))["e_data"],
                token=data.encrypt(grant["token"])["e_data"],
                uniqueId=data.encrypt(json.dumps(grant["profile"]["unique_id"]))["e_data"],
                uniqueIdHash=data.hash(grant["profile"]["unique_id"]),
                iv=data.iv
            )

        except IntegrityError as error:
            logger.error("user %s already has %s grant" % (user_id, platformName))
            raise Conflict()

        except DatabaseError as error:
            logger.error("Failed storing %s grant for %s" % (platformName, user_id))
            raise InternalServerError(error)

        logger.info("- Successfully Stored %s grant for %s" % (platformName, user_id))

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
            "username":json.loads(username) if username else username,
            "token":json.loads(token),
            "uniqueId":json.loads(uniqueId)
        }

        logger.info("- Successfully decrypted grant")
        return decrypted_grant

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