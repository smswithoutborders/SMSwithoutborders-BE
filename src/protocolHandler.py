import logging
import asyncio

from SwobThirdPartyPlatforms import ImportPlatform
from SwobThirdPartyPlatforms.exceptions import PlatformDoesNotExist

from werkzeug.exceptions import (
    BadRequest,
    Forbidden,
    TooManyRequests,
    UnprocessableEntity
)

logger = logging.getLogger(__name__)


class OAuth2:
    """
    Class representing an OAuth2 authentication flow.

    Attributes:
        origin (str): The origin URL of the request.
        platform_name (str): The name of the platform to authenticate against.
        Platform (SwobThirdPartyPlatforms.platform.Platform): The platform object.
        Methods (SwobThirdPartyPlatforms.methods.Methods): The platform's methods object.
    """

    def __init__(self, origin: str, platform_name: str) -> None:
        """
        Initialize a new instance of the OAuth2 class.

        Args:
            origin (str): The origin URL of the request.
            platform_name (str): The name of the platform to authenticate against.

        Raises:
          BadRequest: If the platform_name is invalid
        """
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
        """
        Retrieve the authorization URL and code_verifier required for the authorization flow.

        Returns:
            dict: A dictionary containing the authorization URL and code_verifier.
        """
        result = self.Methods.authorize()

        return {
            "url": result.get("url"),
            "code_verifier": result.get("code_verifier") or "",
        }

    def validation(self, code, scope=None, code_verifier=None) -> dict:
        """
        Validate the authorization code and retrieve an access token.

        Args:
            code (str): The authorization code.
            scope (str): The scope to request.
            code_verifier (str): The code verifier required for the authorization flow.

        Returns:
            dict: A dictionary containing the auth grant, typically the token and profile data.
        """
        if scope:
            try:
                result = self.Methods.validate(code=code, scope=scope)

            except self.Platform.exceptions.MisMatchScope:
                raise UnprocessableEntity()

        elif code_verifier:
            result = self.Methods.validate(
                code=code, code_verifier=code_verifier)
        else:
            result = self.Methods.validate(code=code)

        return {"grant": result}

    def invalidation(self, token: str) -> None:
        """
        Invalidate an access token.

        Args:
            token (str): The access token to invalidate.
        """
        try:
            self.Methods.invalidate(token=token)

            return None

        except Exception as error:
            logger.exception(error)


class TwoFactor:
    """
    A class representing a two-factor authentication platform.

    Attributes:
      identifier (str): An identifier for the user.
      platform_name (str): The name of the platform being used.
      Platform (SwobThirdPartyPlatforms.platform.Platform): The platform object for the specified platform.
      Methods (SwobThirdPartyPlatforms.platform.Methods): The methods object for the specified platform.
    """

    def __init__(self, identifier: str, platform_name: str) -> None:
        """
        Initializes a new instance of the TwoFactor class.

        Args:
          identifier (str): An identifier for the user.
          platform_name (str): The name of the platform being used.
        """
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
        """
        Authorize the user for two-factor authentication.

        Returns:
          dict: A dictionary containing the result of the authorization request.
        """
        try:
            asyncio.run(self.Methods.authorize())

            return {"body": 201}

        except self.Platform.exceptions.SessionExistError:
            return {
                "body": 200
            }

        except self.Platform.exceptions.FloodWaitError:
            raise TooManyRequests()

    def validation(self, code: str, **kwargs) -> dict:
        """
        Validate a code for two-factor authentication.

        Args:
          code (str): The code to validate.

        Returns:
          dict: A dictionary containing the result of the validation request.
        """
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
        """
        Invalidate the user's authentication token.

        Args:
          token (str): The user's authentication token.
        """
        try:
            asyncio.run(self.Methods.invalidate(token=token))

            return None

        except RuntimeError:  # event loop already running
            import nest_asyncio
            nest_asyncio.apply()  # create new event loop and try again

            asyncio.run(self.Methods.invalidate(token=token))

            return None

        except Exception as error:
            logger.exception(error)
