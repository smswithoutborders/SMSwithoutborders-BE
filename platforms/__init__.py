import logging
logger = logging.getLogger(__name__)

from Configs import configuration
config = configuration()
platforms = config["PLATFORMS"]
gmail_path = platforms["GMAIL"]
twitter_path = platforms["TWITTER"]
telegram_path = platforms["TELEGRAM"]

import importlib.util       

from werkzeug.exceptions import BadRequest

PlatformData=()

async def platform_switch(originalUrl: str, platform_name: str, protocol: str, method: str, code:str=None, code_verifier:str = None, token:str=None, phoneNumber:str = None) -> PlatformData:
    """
    """
    # ======================== #
    # ========= GMAIL ======== #
    # ======================== #
    if platform_name == "gmail":

        if protocol == "oauth2":
            logger.debug("initializing %s %s client ..." % (platform_name, protocol))

            spec = importlib.util.spec_from_file_location("gmail_app", gmail_path)   
            gmail = importlib.util.module_from_spec(spec)       
            spec.loader.exec_module(gmail)

            gmailClient = gmail.Gmail()

            logger.info("- Successfully initialized %s %s client" % (platform_name, protocol))

            if method.lower() == "post":
                logger.debug("starting %s init method ..." % platform_name)

                url = gmailClient.init(originalUrl)

                logger.info("- Successfully fetched %s init url" % platform_name)

                return url
                
            elif method.lower() == "put":
                logger.debug("starting %s validate method ..." % platform_name)

                result = gmailClient.validate(originalUrl, code)

                logger.info("- Successfully fetched %s user_info and tokens" % platform_name)

                return result

            elif method.lower() == "delete":
                logger.debug("starting %s revoke method ..." % platform_name)

                result = gmailClient.revoke(token)
                
                logger.info("- Successfully revoked %s token" % platform_name)

                return result

            else:
                logger.error("invalid method: %s" % method)
                raise BadRequest()

        else:
            logger.error("invalid protocol: %s" % protocol)
            raise BadRequest()

    # ======================== #
    # ======= TWITTER ======== #
    # ======================== #
    elif platform_name == "twitter":

        if protocol == "oauth2":
            logger.debug("initializing %s %s client ..." % (platform_name, protocol))

            spec = importlib.util.spec_from_file_location("twitter_app", twitter_path)   
            twitter = importlib.util.module_from_spec(spec)       
            spec.loader.exec_module(twitter)

            twitterClient = twitter.Twitter(originalUrl=originalUrl)

            logger.info("- Successfully initialized %s %s client" % (platform_name, protocol))

            if method.lower() == "post":
                logger.debug("starting %s init method ..." % platform_name)

                url = twitterClient.init()

                logger.info("- Successfully fetched %s init url" % platform_name)

                return url
                
            elif method.lower() == "put":
                logger.debug("starting %s validate method ..." % platform_name)

                result = twitterClient.validate(code=code, code_verifier=code_verifier)

                logger.info("- Successfully fetched %s user_info and tokens" % platform_name)

                return result

            elif method.lower() == "delete":
                logger.debug("starting %s revoke method ..." % platform_name)

                result = twitterClient.revoke(token=token)
                
                logger.info("- Successfully revoked %s token" % platform_name)

                return result

            else:
                logger.error("invalid method: %s" % method)
                raise BadRequest()

        else:
            logger.error("invalid protocol: %s" % protocol)
            raise BadRequest()

    # ======================== #
    # ======= TELEGRAM ======= #
    # ======================== #
    elif platform_name == "telegram":

        if protocol == "twofactor":
            logger.debug("initializing %s %s client ..." % (platform_name, protocol))

            spec = importlib.util.spec_from_file_location("telegram", telegram_path)   
            telegram = importlib.util.module_from_spec(spec)       
            spec.loader.exec_module(telegram)

            telegramApp = telegram.TelegramApp(phone_number = phoneNumber)

            logger.info("- Successfully initialized %s %s client" % (platform_name, protocol))

            if method.lower() == "post":
                try:
                    logger.debug("starting %s init method ..." % platform_name)

                    await telegramApp.initialization()

                    return {
                        "body": 201
                    }
                except telegram.Conflict:
                    return {
                        "body": 200
                    }
                
            elif method.lower() == "put":
                try:      
                    logger.debug("starting %s validate method ..." % platform_name)

                    result = await telegramApp.validation(code=code)

                    return result
                except telegram.RegisterAccount:
                    return {
                        "body": 202
                    }

            elif method.lower() == "delete":
                logger.debug("starting %s revoke method ..." % platform_name)

                await telegramApp.revoke()
                
                return True

            else:
                logger.error("invalid method: %s" % method)
                raise BadRequest()

        else:
            logger.error("invalid protocol: %s" % protocol)
            raise BadRequest()

    else:
        logger.error("invalid platform name: %s" % platform_name)
        raise BadRequest()