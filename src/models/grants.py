import logging
import json

from peewee import DatabaseError

from SwobThirdPartyPlatforms import ImportPlatform
from SwobThirdPartyPlatforms.exceptions import PlatformDoesNotExist

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import InternalServerError

from src.schemas.wallets import Wallets
from src.schemas.usersinfo import UsersInfos

from src.protocolHandler import OAuth2, TwoFactor

from src.security.data import Data

from src.models.broadcast import publish


GrantObject = ()

logger = logging.getLogger(__name__)


class Grant_Model:
    """
    Note:
      A "grant" is an object (dictionary) that basically contains third-party platform information peculiar to a user.
      This can be information like the auth token and the profile data from third party platform, say Twitter
      for example, preformatted in the SWOB Custom Third Party Platforms Project.
      The Grant_Model class provides a layer of abstraction for manipulating grants, and methods for storing,
      decrypting, finding, and deleting them.
    """

    def __init__(self) -> None:
        """
        Initializes an Grant_Model instance.
        """
        self.Wallets = Wallets
        self.UsersInfos = UsersInfos
        self.Data = Data

    def store(self, user_id: str, platform_id: str, grant: dict) -> None:
        """
        Store the grant for a user and a platform.

        Args:
            user_id (str): User ID.
            platform_id (str): Platform ID.
            grant (dict): Grant information.

        Raises:
            InternalServerError: If there is an error storing the grant.
            Conflict: If the user already has a grant for the platform.
        """
        platformName = platform_id.lower()
        data = self.Data()

        logger.debug("Storing %s grant for %s ..." % (platformName, user_id))

        try:
            self.Wallets.get(self.Wallets.uniqueIdHash ==
                             data.hash(grant["profile"]["unique_id"]))

        except self.Wallets.DoesNotExist:
            try:
                self.Wallets.create(
                    userId=user_id,
                    platformId=platform_id,
                    username=data.encrypt(grant["profile"]["name"]),
                    token=data.encrypt(grant["token"]),
                    uniqueId=data.encrypt(grant["profile"]["unique_id"]),
                    uniqueIdHash=data.hash(grant["profile"]["unique_id"]),
                )

                logger.info("- Successfully Stored %s grant for %s" %
                            (platformName, user_id))

            except DatabaseError as error:
                logger.error("Failed storing %s grant for %s" %
                             (platformName, user_id))
                raise InternalServerError(error)

        else:
            logger.error("user %s already has %s grant" %
                         (user_id, platformName))
            raise Conflict()

    def decrypt(self, grant, refresh: bool = False) -> dict:
        """
        Decrypt a grant.

        Args:
            grant: The grant to decrypt.
            refresh (bool, optional): Whether to refresh the token.

        Returns:
            dict: The decrypted grant.
        """

        logger.debug("decrypting grant ...")

        data = self.Data()

        username = data.decrypt(data=grant.username)
        token = data.decrypt(data=grant.token)
        uniqueId = data.decrypt(data=grant.uniqueId)

        decrypted_grant = {
            "username": username,
            "token": json.loads(token),
            "uniqueId": uniqueId
        }

        logger.info("- Successfully decrypted grant")
        return decrypted_grant

    def delete(self, grant) -> None:
        """
        Delete a grant.

        Args:
            grant: The grant to delete.

        Raises:
            InternalServerError: If there is an error deleting the grant.
        """

        try:
            logger.debug("Deleteing grant ...")

            data = self.Data()

            msisdn_hash = self.UsersInfos.get(
                self.UsersInfos.userId == grant.userId).full_phone_number

            grant.delete_instance()

            publish(body={
                "msisdn_hashed": data.encrypt(data=msisdn_hash)
            })

            logger.info("- Successfully deleted grant")

        except DatabaseError as error:
            logger.error("Failed deleting grant")
            raise InternalServerError(error)

    def find(self, user_id: str, platform_id: str) -> GrantObject:
        """
        Find a grant.

        Args:
            user_id (str): User ID.
            platform_id (str): Platform ID.

        Returns:
            GrantObject: The grant object.

        Raises:
            BadRequest: If the grant is not found.
            InternalServerError: If there is an error finding the grant.
        """

        try:
            logger.debug("Finding grant user_id:%s, platform_id:%s ..." %
                         (user_id, platform_id))

            grant = self.Wallets.get(
                self.Wallets.userId == user_id,
                self.Wallets.platformId == platform_id
            )

            logger.info("- Successfully found grant")

            return grant

        except self.Wallets.DoesNotExist:
            logger.error("Grant user_id:%s, platform_id:%s not found" %
                         (user_id, platform_id))
            raise BadRequest()

        except DatabaseError as error:
            raise InternalServerError(error)

    def find_all(self, user_id: str) -> GrantObject:
        """
        Find all grants for a user.

        Args:
            user_id (str): User ID.

        Returns:
            GrantObject: The grants object.

        Raises:
            InternalServerError: If there is an error finding the grants.
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
        Purge a grant.

        Args:
            originUrl (str): The origin URL.
            identifier (str): The identifier.
            platform_name (str): The platform name.
            token (str): The token.

        Raises:
            BadRequest: If the platform name is invalid.
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
                Protocol = OAuth2(origin=originUrl,
                                  platform_name=platform_name)
            elif protocol == "twofactor":
                Protocol = TwoFactor(identifier=identifier,
                                     platform_name=platform_name)

            Protocol.invalidation(token=token)
