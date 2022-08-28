import logging
logger = logging.getLogger(__name__)

from Configs import baseConfig
config = baseConfig()
platforms = config["PLATFORMS"]
gmail_path = platforms["GMAIL"]
twitter_path = platforms["TWITTER"]
telegram_path = platforms["TELEGRAM"]

import importlib.util       

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Forbidden
from werkzeug.exceptions import TooManyRequests

PlatformData=()

async def platform_switch(originalUrl: str, platform_name: str, protocol: str, method: str, code:str=None, code_verifier:str = None, token:dict=None, phoneNumber:str = None, action:str = None, first_name:str = None, last_name:str = None) -> PlatformData:
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

            gmailClient = gmail.Gmail(originalUrl=originalUrl)

            logger.info("- Successfully initialized %s %s client" % (platform_name, protocol))

            if method.lower() == "post":
                logger.debug("starting %s init method ..." % platform_name)

                result = gmailClient.init()

                logger.info("- Successfully fetched %s init url" % platform_name)

                return {
                    "url": result["url"]
                }
                
            elif method.lower() == "put":
                logger.debug("starting %s validate method ..." % platform_name)

                result = gmailClient.validate(code=code)

                logger.info("- Successfully fetched %s user_info and tokens" % platform_name)

                return {
                    "grant": result
                }

            elif method.lower() == "delete":
                try:
                    logger.debug("starting %s revoke method ..." % platform_name)

                    gmailClient.revoke(token=token)
                    
                    logger.info("- Successfully revoked %s token" % platform_name)
                except Exception as error:
                    logger.exception(error)
                    
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

                result = twitterClient.init()

                logger.info("- Successfully fetched %s init url" % platform_name)

                return {
                    "url": result["url"],
                    "code_verifier": result["code_verifier"]
                }
                
            elif method.lower() == "put":
                logger.debug("starting %s validate method ..." % platform_name)

                result = twitterClient.validate(code=code, code_verifier=code_verifier)

                logger.info("- Successfully fetched %s user_info and tokens" % platform_name)

                return {
                    "grant": result
                }

            elif method.lower() == "delete":
                try:
                    logger.debug("starting %s revoke method ..." % platform_name)

                    twitterClient.revoke(token=token)
                    
                    logger.info("- Successfully revoked %s token" % platform_name)
                except Exception as error:
                    from werkzeug.exceptions import InternalServerError
                    raise InternalServerError(error)
                    # logger.exception(error)

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
                except telegram.SessionExistError:
                    return {
                        "body": 200
                    }
                except telegram.TooManyRequests:
                    raise TooManyRequests()
                
            elif method.lower() == "put":
                if action == "register":
                    try:
                        logger.debug("starting %s registration method ..." % platform_name)

                        result = await telegramApp.register(first_name=first_name, last_name=last_name)

                        return {
                            "grant": result
                        }
                    except telegram.InvalidCodeError:
                        raise Forbidden()
                    except telegram.TooManyRequests:
                        raise TooManyRequests()
                        
                else:
                    try:      
                        logger.debug("starting %s validate method ..." % platform_name)

                        result = await telegramApp.validation(code=code)

                        return {
                            "grant": result
                        }
                    except telegram.RegisterAccountError:
                        return {
                            "body": 202,
                            "initialization_url": f"/platforms/{platform_name}/protocols/{protocol}/register"
                        }
                    except telegram.InvalidCodeError:
                        raise Forbidden()
                    except telegram.TooManyRequests:
                        raise TooManyRequests()

            elif method.lower() == "delete":
                try:
                    logger.debug("starting %s revoke method ..." % platform_name)

                    await telegramApp.revoke()
                    
                    logger.info("- Successfully revoked %s token" % platform_name)
                except Exception as error:
                    logger.exception(error)

            else:
                logger.error("invalid method: %s" % method)
                raise BadRequest()

        else:
            logger.error("invalid protocol: %s" % protocol)
            raise BadRequest()

    # ======================== #
    # == Add more platforms == #
    # ======================== #

    else:
        logger.error("invalid platform name: %s" % platform_name)
        raise BadRequest()