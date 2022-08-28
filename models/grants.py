import logging
logger = logging.getLogger(__name__)

from Configs import baseConfig
config = baseConfig()
platforms = config["PLATFORMS"]
gmail_path = platforms["GMAIL"]
twitter_path = platforms["TWITTER"]
telegram_path = platforms["TELEGRAM"]

import importlib.util       
import json

from peewee import IntegrityError
from peewee import DatabaseError

from schemas.wallets import Wallets

from security.data import Data

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import InternalServerError

GrantObject = ()

class Grant_Model:
    def __init__(self) -> None:
        self.Wallets = Wallets
        self.Data = Data

    def store(self, user_id: str, platform_name: str, platform_id: int, grant: dict) -> None:
        """
        """
        platformName = platform_name.lower()
        data = self.Data()

        # ======================== #
        # ========= GMAIL ======== #
        # ======================== #
        if platformName == "gmail":
            logger.debug("Storing %s grant for %s ..." % (platformName, user_id))

            try:
                self.Wallets.create(
                    userId=user_id, 
                    platformId=platform_id,
                    username=data.encrypt(json.dumps(grant["profile"]["name"]))["e_data"],
                    token=data.encrypt(grant["token"])["e_data"],
                    uniqueId=data.encrypt(json.dumps(grant["profile"]["email"]))["e_data"],
                    uniqueIdHash=data.hash(grant["profile"]["email"]),
                    iv=data.iv
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
                    userId=user_id, 
                    platformId=platform_id,
                    username=data.encrypt(json.dumps(grant["profile"]["name"]))["e_data"],
                    token=data.encrypt(grant["token"])["e_data"],
                    uniqueId=data.encrypt(json.dumps(grant["profile"]["username"]))["e_data"],
                    uniqueIdHash=data.hash(grant["profile"]["username"]),
                    iv=data.iv
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
                    userId=user_id, 
                    platformId=platform_id,
                    username=data.encrypt(json.dumps(grant["profile"]["first_name"]))["e_data"],
                    token=data.encrypt(json.dumps(grant["phone_number"]))["e_data"],
                    uniqueId=data.encrypt(json.dumps(grant["phone_number"]))["e_data"],
                    uniqueIdHash=data.hash(grant["phone_number"]),
                    iv=data.iv
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

    def decrypt(self, platform_name: str, grant, refresh: bool = False) -> dict:
        """
        """
        platformName = platform_name.lower()

        logger.debug("decrypting %s grant ..." % platformName)

        data = self.Data()

        iv = grant.iv
        username = data.decrypt(data=grant.username, iv=iv)
        token = data.decrypt(data=grant.token, iv=iv)
        uniqueId = data.decrypt(data=grant.uniqueId, iv=iv)

        # ======================== #
        # ========= GMAIL ======== #
        # ======================== #
        if platformName == "gmail":
            decrypted_grant = {
                "username":json.loads(username),
                "token":json.loads(token),
                "uniqueId":json.loads(uniqueId)
            }

            logger.info("- Successfully decrypted %s grant" % platformName)
            return decrypted_grant
        
        # ======================== #
        # ======= TWITTER ======== #
        # ======================== #
        elif platformName == "twitter":
            if refresh:
                logger.debug("initializing %s client ..." % platformName)

                spec = importlib.util.spec_from_file_location("twitter_app", twitter_path)   
                twitter = importlib.util.module_from_spec(spec)       
                spec.loader.exec_module(twitter)

                twitterClient = twitter.Twitter(originalUrl="")

                logger.debug("starting %s refresh method ..." % platformName)

                r_token = twitterClient.refresh(token=json.loads(token))

                upd_wallet = (
                    self.Wallets.update(
                    username=data.encrypt(username)["e_data"],
                    token=data.encrypt(json.dumps(r_token))["e_data"],
                    uniqueId=data.encrypt(uniqueId)["e_data"],
                    iv=data.iv)
                    .where(
                        self.Wallets.id == grant.id
                    )
                )

                upd_wallet.execute()
                
                logger.info("- Successfully refreshed %s token" % platformName)

                decrypted_grant = {
                    "username":json.loads(username),
                    "token":r_token,
                    "uniqueId":json.loads(uniqueId)
                }

                logger.info("- Successfully decrypted %s grant" % platformName)
                return decrypted_grant

            else:
                decrypted_grant = {
                    "username":json.loads(username),
                    "token":json.loads(token),
                    "uniqueId":json.loads(uniqueId)
                }

                logger.info("- Successfully decrypted %s grant" % platformName)
                return decrypted_grant

        # ======================== #
        # ======= TELEGRAM ======= #
        # ======================== #
        elif platformName == "telegram":
            decrypted_grant = {
                "username":json.loads(username) if username else username,
                "token":json.loads(token),
                "uniqueId":json.loads(uniqueId)
            }

            logger.info("- Successfully decrypted %s grant" % platformName)
            return decrypted_grant

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

            grant = self.Wallets.get(self.Wallets.userId == user_id, self.Wallets.platformId == platform_id)

            logger.info("- Successfully found grant")

            return grant

        except self.Wallets.DoesNotExist:
            logger.error("Grant user_id:%s, platform_id:%d not found" % (user_id, platform_id))
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

    async def purge(self, originalUrl: str, platform_name: str, token: str) -> None:
        """
        """
        platformName = platform_name.lower()

        # ======================== #
        # ========= GMAIL ======== #
        # ======================== #
        if platformName == "gmail":
            try:
                logger.debug("initializing %s client ..." % platformName)

                spec = importlib.util.spec_from_file_location("gmail_app", gmail_path)   
                gmail = importlib.util.module_from_spec(spec)       
                spec.loader.exec_module(gmail)

                gmailClient = gmail.Gmail(originalUrl=originalUrl)

                logger.debug("starting %s revoke method ..." % platformName)

                gmailClient.revoke(token=token)
                
                logger.info("- Successfully revoked %s token" % platformName)
                
            except Exception as error:
                logger.exception(error)
        
        # ======================== #
        # ======= TWITTER ======== #
        # ======================== #
        elif platformName == "twitter":
            try:
                logger.debug("initializing %s client ..." % platformName)

                spec = importlib.util.spec_from_file_location("twitter_app", twitter_path)   
                twitter = importlib.util.module_from_spec(spec)       
                spec.loader.exec_module(twitter)

                twitterClient = twitter.Twitter(originalUrl=originalUrl)

                logger.debug("starting %s revoke method ..." % platformName)

                twitterClient.revoke(token=token)
                
                logger.info("- Successfully revoked %s token" % platformName)

            except Exception as error:
                logger.exception(error)

        # ======================== #
        # ======= TELEGRAM ======= #
        # ======================== #
        elif platformName == "telegram":
            try:
                logger.debug("initializing %s client ..." % platformName)

                spec = importlib.util.spec_from_file_location("telegram", telegram_path)   
                telegram = importlib.util.module_from_spec(spec)       
                spec.loader.exec_module(telegram)

                telegramApp = telegram.TelegramApp(phone_number = token)

                logger.debug("starting %s revoke method ..." % platformName)

                await telegramApp.revoke()
                
                logger.info("- Successfully revoked %s token" % platformName)
                
            except Exception as error:
                logger.exception(error)

        # ======================== #
        # == Add more platforms == #
        # ======================== #

        else:
            logger.error("Invalid platform name %s" % platformName)
            raise BadRequest()