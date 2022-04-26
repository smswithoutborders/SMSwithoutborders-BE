import logging
from unittest import result
logger = logging.getLogger(__name__)

import os

from error import BadRequest, InternalServerError
from platforms import gmail

gmail_credentials_file = os.path.abspath("credentials.json")

if not os.path.exists(gmail_credentials_file):
    error = f"Gmail credentials file not found at {gmail_credentials_file}"
    raise InternalServerError(error)

gmail_scopes = [
    'openid',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
]

def platform_switch(originalUrl, platform_name, protocol, method, code=None, token=None):
    if platform_name == "gmail":

        if protocol == "oauth2":
            logger.debug(f"initializing {platform_name} {protocol} client ...")
            gmailClient = gmail.OAuth2(gmail_credentials_file, gmail_scopes)

            logger.info(f"successfully initialized {platform_name} {protocol} client")
            if method.lower() == "post":
                logger.debug(f"starting {platform_name} init method ...")
                url = gmailClient.init(originalUrl)

                logger.info(f"successfully fetched {platform_name} init url")
                return {
                    "url": url
                }
            elif method.lower() == "put":
                logger.debug(f"starting {platform_name} validate method ...")
                result = gmailClient.validate(originalUrl, code)

                logger.info(f"successfully fetched {platform_name} user_info")
                return result
            elif method.lower() == "delete":
                logger.debug(f"starting {platform_name} revoke method ...")
                result = gmailClient.revoke(token)
                
                logger.info(f"successfully revoked {platform_name} token")
                return result
            else:
                logger.error(f"invalid method {method}")
                raise BadRequest()
        else:
            logger.error(f"invalid protocol {protocol}")
            raise BadRequest()
    else:
        logger.error(f"invalid platform name {platform_name}")
        raise BadRequest()