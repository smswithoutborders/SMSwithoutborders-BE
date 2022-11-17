import logging
import asyncio

from Configs import baseConfig
config = baseConfig()

from src.schemas.platforms import Platforms
from utils.platformHelper import importplatform

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Forbidden
from werkzeug.exceptions import TooManyRequests
from werkzeug.exceptions import UnprocessableEntity

logger = logging.getLogger(__name__)

class OAuth2:

    def __init__(self, origin: str, platform_name: str) -> None:
        """
        """
        self.origin = origin
        self.platform_name = platform_name
        self.Platform = importplatform(platform_name=self.platform_name)

        try:
            Platforms.get(Platforms.name == self.platform_name)
        except Platforms.DoesNotExist:
            logger.error("invalid platform name: %s" % self.platform_name)
            raise BadRequest()  
        else:       
            if not self.Platform:
                logger.error("invalid platform name: %s" % self.platform_name)
                raise BadRequest()     
            else:
                self.Methods = self.Platform.Methods(origin = self.origin)

    def authorization(self) -> dict:
        """
        """
        result = self.Methods.authorize()

        return {
            "url": result.get("url"),
            "code_verifier": result.get("code_verifier") or ""
        }

    def validation(self, code, scope=None, code_verifier=None) -> dict:
        """
        """
        if scope:
            try:    
                result = self.Methods.validate(code=code, scope=scope)
            
            except self.Platform.MisMatchScope:
                raise UnprocessableEntity()

        elif code_verifier:
            result = self.Methods.validate(code=code, code_verifier=code_verifier)
        else:
            result = self.Methods.validate(code=code)

        return {
            "grant": result
        }

    def invalidation(self, token) -> None:
        """
        """
        try:
            self.Methods.invalidate(token=token)

            return None
            
        except Exception as error:
            logger.exception(error)

class TwoFactor:

    def __init__(self, identifier: str, platform_name: str) -> None:
        """
        """
        self.identifier = identifier
        self.platform_name = platform_name
        self.Platform = importplatform(platform_name=self.platform_name)

        if not self.Platform:
            logger.error("invalid platform name: %s" % self.platform_name)
            raise BadRequest()     
        else:
            self.Methods = self.Platform.Methods(identifier = self.identifier)  

    def authorization(self) -> dict:
        """
        """
        try:
            asyncio.run(self.Methods.authorize())

            return {
                "body": 201
            }

        except self.Platform.SessionExistError:
            return {
                "body": 200
            }
            
        except self.Platform.TooManyRequests:
            raise TooManyRequests()
    
    def validation(self, code: str, **kwargs) -> dict:
        """
        """
        try:      
            result = asyncio.run(self.Methods.validate(code=code))

            return {
                "grant": result
            }

        except self.Platform.RegisterAccountError:
            return {
                "body": 202,
                "initialization_url": f"/platforms/{self.platform_name}/protocols/twofactor/register"
            }

        except self.Platform.InvalidCodeError:
            raise Forbidden()

        except self.Platform.TooManyRequests:
            raise TooManyRequests()

    def registration(self, first_name: str, last_name: str) -> dict:
        """
        """
        try:
            result = asyncio.run(self.Methods.register(first_name=first_name, last_name=last_name))

            return {
                "grant": result
            }

        except self.Platform.InvalidCodeError:
            raise Forbidden()

        except self.Platform.TooManyRequests:
            raise TooManyRequests()

    def invalidation(self, token: str, **kwargs) -> None:
        """
        """
        try:
            self.Methods = self.Platform.Methods(identifier = token)  

            asyncio.run(self.Methods.invalidate())

            return None
            
        except Exception as error:
            logger.exception(error)