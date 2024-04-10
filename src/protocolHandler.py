import logging
import asyncio

from SwobThirdPartyPlatforms import ImportPlatform
from SwobThirdPartyPlatforms.exceptions import PlatformDoesNotExist

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Forbidden
from werkzeug.exceptions import TooManyRequests
from werkzeug.exceptions import UnprocessableEntity

logger = logging.getLogger(__name__)


class OAuth2:
    def __init__(self, origin: str, platform_name: str) -> None:
        """ """
        self.origin = origin
        self.platform_name = platform_name

        try:
            self.Platform = ImportPlatform(platform_name=self.platform_name)
        except PlatformDoesNotExist:
            logger.error("invalid platform name: %s" % self.platform_name)
            raise BadRequest()
        else:
            self.Methods = self.Platform.methods(origin=self.origin)

    def authorization(self) -> dict:
        """ """
        result = self.Methods.authorize()

        return {
            "url": result.get("url"),
            "code_verifier": result.get("code_verifier") or "",
        }

    def validation(self, code, scope=None, code_verifier=None) -> dict:
        """ """
        if scope:
            try:
                result = self.Methods.validate(code=code, scope=scope)

            except self.Platform.exceptions.MisMatchScope:
                raise UnprocessableEntity()

        elif code_verifier:
            result = self.Methods.validate(code=code, code_verifier=code_verifier)
        else:
            result = self.Methods.validate(code=code)

        return {"grant": result}

    def invalidation(self, token: str) -> None:
        """ """
        try:
            self.Methods.invalidate(token=token)

            return None

        except Exception as error:
            logger.exception(error)


class TwoFactor:
    def __init__(self, identifier: str, platform_name: str) -> None:
        """ """
        self.identifier = identifier
        self.platform_name = platform_name

        try:
            self.Platform = ImportPlatform(platform_name=self.platform_name)
        except PlatformDoesNotExist:
            logger.error("invalid platform name: %s" % self.platform_name)
            raise BadRequest()
        else:
            self.Methods = self.Platform.methods(identifier=self.identifier)

    def authorization(self) -> dict:
        """ """
        try:
            asyncio.run(self.Methods.authorize())

            return {"body": 201}

        except self.Platform.exceptions.SessionExistError:
            return {"body": 200}

        except self.Platform.exceptions.FloodWaitError:
            raise TooManyRequests()

    def validation(self, code: str, **kwargs) -> dict:
        """ """
        try:
            result = asyncio.run(self.Methods.validate(code=code))

            return {"grant": result}

        except self.Platform.exceptions.SessionPasswordNeededError:
            return {
                "body": 202,
                "initialization_url": f"/platforms/{self.platform_name}/protocols/twofactor/password",
            }

        except (self.Platform.exceptions.PhoneCodeInvalidError, self.Platform.exceptions.PhoneCodeExpiredError):
            raise Forbidden()

        except self.Platform.exceptions.FloodWaitError:
            raise TooManyRequests()

    def password_validation(self, password: str) -> dict:
        """ """
        try:
            result = asyncio.run(
                self.Methods.validate_with_password(password=password)
            )

            return {"grant": result}

        except self.Platform.exceptions.PasswordHashInvalidError:
            raise Forbidden()

        except self.Platform.exceptions.FloodWaitError:
            raise TooManyRequests()

    def invalidation(self, token: str) -> None:
        """ """
        try:
            asyncio.run(self.Methods.invalidate(token=token))

            return None

        except RuntimeError:
            import nest_asyncio

            nest_asyncio.apply()

            asyncio.run(self.Methods.invalidate(token=token))

            return None

        except Exception as error:
            logger.exception(error)
