import logging
logger = logging.getLogger(__name__)

from Configs import configuration
config = configuration()
platforms = config["PLATFORMS"]
gmail_path = platforms["GMAIL"]

import importlib.util       

from werkzeug.exceptions import BadRequest

PlatformData=()

def platform_switch(originalUrl: str, platform_name: str, protocol: str, method: str, code:str=None, token:str=None) -> PlatformData:
    """
    """
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

                return {"url": url}
                
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

    else:
        logger.error("invalid platform name: %s" % platform_name)
        raise BadRequest()