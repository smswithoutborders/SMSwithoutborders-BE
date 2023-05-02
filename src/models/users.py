from werkzeug.exceptions import InternalServerError
from werkzeug.exceptions import TooManyRequests
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Unauthorized
from src.security.data import Data
from SwobThirdPartyPlatforms import ImportPlatform, available_platforms
from src.schemas.wallets import Wallets
from src.schemas.retries import Retries
from src.schemas.usersinfo import UsersInfos
from src.schemas.users import Users
from src.schemas.db_connector import db
from peewee import DatabaseError
from settings import Configurations
import logging
import requests
from datetime import datetime
from datetime import timedelta

logger = logging.getLogger(__name__)

ENABLE_RECAPTCHA = Configurations.ENABLE_RECAPTCHA
SECRET_KEY = Configurations.RECAPTCHA_SECRET_KEY
ENABLE_BLOCKING = Configurations.ENABLE_BLOCKING
ATTEMPTS = Configurations.SHORT_BLOCK_ATTEMPTS
BLOCKS = Configurations.LONG_BLOCK_ATTEMPTS
ATTEMPTS_TIME = Configurations.SHORT_BLOCK_DURATION
BLOCKS_TIME = Configurations.LONG_BLOCK_DURATION


UserObject = ()
UserPlatformObject = ()


class User_Model:
    """
    A class representing a user of the SWOB platform.

    The User_Model class provides a layer of abstraction that encompasses attributes and methods peculiar
    to a user of the SWOB platform, which also aids in interacting with the user data and transactions
    carried out throughout the flow.
    """

    def __init__(self) -> None:
        """
        Initializes a new instance of the User_Model class.

        This method sets up the instance variables to enable interaction with the user data and transactions.
        """

        self.db = db
        self.Users = Users
        self.UsersInfos = UsersInfos
        self.Retries = Retries
        self.Data = Data
        self.Wallets = Wallets

    def create(self, phone_number: str, country_code: str, name: str, password: str) -> str:
        """
        Create a new user account.

        Args:
            phone_number (str): The user's phone number.
            country_code (str): The country code of the user's phone number.
            name (str): The user's name.
            password (str): The user's password.

        Returns:
            str: The ID of the newly created user.

        Raises:
            Conflict: If a user with the provided phone number already exists.
            InternalServerError: If there was an error creating the user, such as a database error.

        Note:
            This method creates a new user account by encrypting and storing the user's phone number, country code, name,
            and password in the database. The phone number and country code are hashed using the provided hash method.
            The name and country code are encrypted using the provided encrypt method. The password is hashed using the
            provided hash method. If the user already has a verified account with the same phone number and country code,
            a new account will not be created and a Conflict error will be raised.
        """
        try:
            data = self.Data()
            full_phone_number = country_code+phone_number
            phone_number_hash = data.hash(data=full_phone_number)

            logger.debug("Finding verified userinfo: %s" % phone_number_hash)

            result = []

            userinfos = (
                self.UsersInfos.select()
                .where(
                    self.UsersInfos.full_phone_number == phone_number_hash,
                    self.UsersInfos.status == "verified"
                )
                .dicts()
            )

            for userinfo in userinfos:
                result.append(userinfo)

            # check for duplicate user
            if len(result) > 1:
                logger.error("Duplicate verified users found: %s" %
                             phone_number_hash)
                raise Conflict()

            logger.info("- Successfully found verified users: %s" %
                        phone_number_hash)

            # check for no user
            if len(result) < 1:
                logger.debug("creating user '%s' ..." % phone_number_hash)

                data = self.Data()
                password_hash = data.hash(password)

                new_user = self.Users.create(
                    password=password_hash
                )

                self.UsersInfos.create(
                    name=data.encrypt(data=name),
                    country_code=data.encrypt(data=country_code),
                    full_phone_number=phone_number_hash,
                    userId=new_user.id,
                )

                logger.info("- User '%s' successfully created" %
                            phone_number_hash)
                return str(new_user.id)
            else:
                logger.error("user '%s' already has an acount" %
                             phone_number_hash)
                raise Conflict()

        except DatabaseError as err:
            logger.error("creating user '%s' failed check logs" %
                         full_phone_number)
            raise InternalServerError(err)

    def verify(self, password: str, phone_number: str = None, user_id: str = None) -> dict:
        """
        Verify a user's credentials.

        Args:
            password (str): The user's password.
            phone_number (str): The user's phone number (in international format).
            user_id (str): The ID of the user.

        Returns:
            dict: A dictionary containing the user's information, as per UsersInfo Schema.

        Raises:
            Unauthorized: If the user's phone number, ID or password is invalid.
            Conflict: If there are multiple verified accounts with the same phone number.
            InternalServerError: If there was an error verifying the user's credentials, such as a database error.

        Note:
            This method verifies a user's credentials by checking the provided phone number (if provided) or user ID (if
            provided) against the hashed phone numbers of verified users in the database. If a verified user with a matching
            phone number or user ID is found, the provided password is checked against the hashed password of the user in
            the database. If the password matches, a dictionary containing the user's information is returned. If the phone
            number or user ID is invalid, or if there are multiple verified accounts with the same phone number, an error
            will be raised.
        """

        try:
            data = self.Data()
            password_hash = data.hash(password)

            if phone_number:
                phone_number_hash = data.hash(phone_number)

                if ENABLE_BLOCKING:
                    counter = self.check_count(unique_id=phone_number_hash)

                logger.debug("Verifying user: %s" % phone_number_hash)

                userinfos = (
                    self.UsersInfos.select()
                    .where(
                        self.UsersInfos.full_phone_number == phone_number_hash,
                        self.UsersInfos.status == "verified"
                    )
                    .dicts()
                )

                # check for no user
                if len(userinfos) < 1:
                    if ENABLE_BLOCKING:
                        self.add_count(counter=counter)

                    logger.error("Invalid Phone number")
                    raise Unauthorized()

                # check for duplicate user
                if len(userinfos) > 1:
                    logger.error("Duplicate verified users found: %s" %
                                 phone_number_hash)
                    raise Conflict()

                logger.debug("Verifying password for user: %s" %
                             phone_number_hash)

                users = (
                    self.Users.select()
                    .where(
                        self.Users.id == userinfos[0]["userId"],
                        self.Users.password == password_hash
                    )
                    .dicts()
                )

                # check for no user
                if len(users) < 1:
                    if ENABLE_BLOCKING:
                        self.add_count(counter=counter)

                    logger.error("Invalid password")
                    raise Unauthorized()

                # check for duplicate user
                if len(users) > 1:
                    logger.error("Duplicate users found: %s" %
                                 phone_number_hash)
                    raise Conflict()

                if ENABLE_BLOCKING:
                    self.delete_count(counter_id=counter.id)

                update_login = self.Users.update(
                    last_login=users[0]["current_login"],
                    current_login=datetime.now()
                ).where(
                    self.Users.id == userinfos[0]["userId"]
                )

                update_login.execute()

                logger.info("- Successfully found verified user: %s" %
                            phone_number_hash)
                return userinfos[0]

            elif user_id:
                if ENABLE_BLOCKING:
                    counter = self.check_count(unique_id=user_id)

                logger.debug("Verifying user: %s" % user_id)

                userinfos = (
                    self.UsersInfos.select()
                    .where(
                        self.UsersInfos.userId == user_id,
                        self.UsersInfos.status == "verified"
                    )
                    .dicts()
                )

                # check for no user
                if len(userinfos) < 1:
                    if ENABLE_BLOCKING:
                        self.add_count(counter=counter)

                    logger.error("Invalid User ID")
                    raise Unauthorized()

                # check for duplicate user
                if len(userinfos) > 1:
                    logger.error(
                        "Duplicate verified users found: %s" % user_id)
                    raise Conflict()

                logger.debug("Verifying password for user: %s" % user_id)

                users = (
                    self.Users.select()
                    .where(
                        self.Users.id == userinfos[0]["userId"],
                        self.Users.password == password_hash
                    )
                    .dicts()
                )

                # check for no user
                if len(users) < 1:
                    if ENABLE_BLOCKING:
                        self.add_count(counter=counter)

                    logger.error("Invalid password")
                    raise Unauthorized()

                # check for duplicate user
                if len(users) > 1:
                    logger.error("Duplicate users found: %s" % user_id)
                    raise Conflict()

                if ENABLE_BLOCKING:
                    self.delete_count(counter_id=counter.id)

                logger.info("- Successfully found verified user: %s" % user_id)
                return users[0]

        except DatabaseError as err:
            logger.error("Failed verifying user check logs")
            raise InternalServerError(err)

    def find(self, phone_number: str = None, user_id: str = None) -> UserObject:
        """
        Finds a user based on their phone number or user ID.

        Args:
            phone_number (str): The phone number of the user to find.
            user_id (str): The user ID of the user to find.

        Returns:
            UserObject: A dictionary containing the user information.

        Raises:
            Unauthorized: If no user is found for the given phone number or user ID.
            Conflict: If more than one user is found for the given phone number or user ID.
            InternalServerError: If there is an error while executing the database query.
        """
        try:
            data = self.Data()

            if phone_number:
                phone_number_hash = data.hash(phone_number)

                logger.debug("finding user: %s" % phone_number_hash)

                userinfos = (
                    self.UsersInfos.select()
                    .where(
                        self.UsersInfos.full_phone_number == phone_number_hash,
                        self.UsersInfos.status == "verified"
                    )
                    .dicts()
                )

                # check for no user
                if len(userinfos) < 1:
                    logger.error("Invalid Phone number")
                    raise Unauthorized()

                # check for duplicate user
                if len(userinfos) > 1:
                    logger.error("Duplicate verified users found: %s" %
                                 phone_number_hash)
                    raise Conflict()

                logger.info("- Successfully found verified user: %s" %
                            phone_number_hash)
                return userinfos[0]

            elif user_id:
                logger.debug("finding user: %s" % user_id)

                userinfos = (
                    self.UsersInfos.select()
                    .where(
                        self.UsersInfos.userId == user_id,
                        self.UsersInfos.status == "verified"
                    )
                    .dicts()
                )

                # check for no user
                if len(userinfos) < 1:
                    logger.error("Invalid User Id")
                    raise Unauthorized()

                # check for duplicate user
                if len(userinfos) > 1:
                    logger.error(
                        "Duplicate verified users found: %s" % user_id)
                    raise Conflict()

                logger.info("- Successfully found verified user: %s" % user_id)

                user = (
                    self.Users.select(
                        self.Users.createdAt,
                        self.Users.last_login
                    )
                    .where(
                        self.Users.id == userinfos[0]["userId"]
                    )
                    .dicts()
                )

                # check for no user
                if len(user) < 1:
                    logger.error("Invalid User Id")
                    raise Unauthorized()

                # check for duplicate user
                if len(user) > 1:
                    logger.error(
                        "Duplicate verified users found: %s" % user_id)
                    raise Conflict()

                return {
                    "userinfo": userinfos[0],
                    "createdAt": user[0]["createdAt"],
                    "last_login": user[0]["last_login"]
                }

        except DatabaseError as err:
            logger.error("Failed finding user check logs")
            raise InternalServerError(err)

    def find_platform(self, user_id: str) -> UserPlatformObject:
        """
        Fetches the saved and unsaved platforms for a user.

        Args:
            user_id (str): The user ID of the user whose platforms to fetch.

        Returns:
            UserPlatformObject: A dictionary containing the saved and unsaved platforms for the user.

        Raises:
            InternalServerError: If there is an error while executing the database query.
        """
        try:
            saved_platforms = []

            user_platforms = {
                "unsaved_platforms": [],
                "saved_platforms": []
            }

            logger.debug("Fetching saved platforms for %s ..." % user_id)

            saved_wallet_platform = (
                self.Wallets.select()
                .where(
                    self.Wallets.userId == user_id
                )
                .dicts()
            )

            for row in saved_wallet_platform:
                saved_platforms.append(row["platformId"])

                Platform = ImportPlatform(platform_name=row["platformId"])
                platform_info = Platform.info

                result = {
                    "name": platform_info["name"].lower(),
                    "description": platform_info["description"],
                    "logo": platform_info["logo"],
                    "initialization_url": f"/platforms/{platform_info['name']}/protocols/{platform_info['protocols'][0]}",
                    "type": platform_info["type"],
                    "letter": platform_info["letter"]
                }

                user_platforms["saved_platforms"].append(result)

            logger.debug("Fetching unsaved platforms for %s ..." % user_id)

            for platform in available_platforms:
                if platform not in saved_platforms:
                    Platform = ImportPlatform(platform_name=platform)
                    platform_info = Platform.info

                    result = {
                        "name": platform_info["name"].lower(),
                        "description": platform_info["description"],
                        "logo": platform_info["logo"],
                        "initialization_url": f"/platforms/{platform_info['name']}/protocols/{platform_info['protocols'][0]}",
                        "type": platform_info["type"],
                        "letter": platform_info["letter"]
                    }

                    user_platforms["unsaved_platforms"].append(result)

            logger.info("- Successfully Fetched users platforms")

            return user_platforms

        except DatabaseError as err:
            logger.error("Failed fetching users platforms check logs")
            raise InternalServerError(err)

    def update(self, user_id: str, status: str = None, password: str = None) -> None:
        """Updates the user information in the database with the given user ID.

        Args:
            user_id (str): The ID of the user to update.
            status (str, optional): The new status to set for the user.
            password (str, optional): The new password to set for the user.

        Raises:
            Unauthorized: If the user with the given ID is not found.
            Conflict: If multiple users are found with the given ID.
            InternalServerError: If an error occurs while updating the user.
        """

        try:
            logger.debug("Finding userinfo with user_id: %s" % user_id)

            result = []

            userinfos = (
                self.UsersInfos.select()
                .where(
                    self.UsersInfos.userId == user_id
                )
                .dicts()
            )

            for userinfo in userinfos:
                result.append(userinfo)

            # check for no user
            if len(result) < 1:
                logger.error("Userinfo with user_id '%s' not found" % user_id)
                raise Unauthorized()

            # check for duplicate user
            if len(result) > 1:
                logger.error(
                    "Duplicate users found with user_id: %s" % user_id)
                raise Conflict()

            logger.info("- Successfully found user with user_id: %s" % user_id)

            if status:
                logger.debug(
                    "updating userinfo status with user_id: '%s' ..." % user_id)

                upd_userinfo = (
                    self.UsersInfos.update(
                        status=status
                    )
                    .where(
                        self.UsersInfos.userId == result[0]["userId"],
                        self.UsersInfos.id == result[0]["id"]
                    )
                )

                upd_userinfo.execute()

                logger.info(
                    "- User status '%s' successfully updated" % user_id)

            elif password:
                logger.debug(
                    "updating user password with user_id: '%s' ..." % user_id)

                upd_user = (
                    self.Users.update(
                        password=password
                    )
                    .where(
                        self.Users.id == result[0]["userId"]
                    )
                )

                upd_user.execute()

                logger.info(
                    "- User password '%s' successfully updated" % user_id)

        except DatabaseError as err:
            logger.error("updating user '%s' failed check logs" % user_id)
            raise InternalServerError(err)

    def delete(self, user_id: str) -> None:
        """
        Deletes the user account and associated user information from the database.

        Args:
            user_id (str): The ID of the user to delete.

        Raises:
            Unauthorized: If the user with the given ID is not found.
            Conflict: If multiple users are found with the given ID.
            InternalServerError: If an error occurs while deleting the user.
        """
        try:
            logger.debug("Finding userinfo with user_id: %s" % user_id)

            userinfos = (
                self.UsersInfos.select()
                .where(
                    self.UsersInfos.userId == user_id
                )
            )

            # check for no user
            if len(userinfos) < 1:
                logger.error("Userinfo with user_id '%s' not found" % user_id)
                raise Unauthorized()

            # check for duplicate user
            if len(userinfos) > 1:
                logger.error(
                    "Duplicate users found with user_id: %s" % user_id)
                raise Conflict()

            user = (
                self.Users.select()
                .where(
                    self.Users.id == userinfos[0].userId
                )
            )

            logger.info("- Successfully found user with user_id: %s" % user_id)

            logger.debug("deleting userinfo with user_id: '%s' ..." % user_id)

            userinfos[0].delete_instance()
            user[0].delete_instance()

            logger.info("- User account '%s' successfully deleted" % user_id)

        except DatabaseError as err:
            logger.error("deleting user '%s' failed check logs" % user_id)
            raise InternalServerError(err)

    def recaptcha(self, captchaToken: str, remoteIp: str) -> bool:
        """Verifies the reCAPTCHA token with the Google reCAPTCHA service.

        Args:
            captchaToken (str): The reCAPTCHA token to verify.
            remoteIp (str): The IP address of the user who submitted the reCAPTCHA.

        Returns:
            bool: True if the token is valid, False otherwise.

        Raises:
            BadRequest: If the reCAPTCHA token is invalid.
            InternalServerError: If an error occurs while verifying the reCAPTCHA.
        """

        try:
            logger.debug("Starting recaptcha verification ...")
            if ENABLE_RECAPTCHA:
                url = f"https://www.google.com/recaptcha/api/siteverify?secret={SECRET_KEY}&response={captchaToken}&remoteip={remoteIp}"

                res = requests.post(url=url)

                json_res = res.json()

                if json_res["success"]:
                    logger.info("- Successfully verified recaptcha")
                    return True
                else:
                    logger.error("Invalid recaptcha token")
                    raise BadRequest()

            else:
                logger.info("- Recaptcha is turn off")
                return True

        except BadRequest:
            raise BadRequest()

        except Exception as error:
            logger.error("Failed verifying recaptcha check logs")
            raise InternalServerError(error)

    def check_count(self, unique_id: str):
        """
        Check the retry count for a given unique identifier.

        Args:
            unique_id (str): A string representing a unique identifier.

        Returns:
            An instance of the Retries schema representing the retry count for the given unique identifier.

        Raises:
            TooManyRequests: If the retry count or block has reached the maximum limit.
        """

        try:
            logger.debug("Finding retry record for %s ..." % unique_id)

            counter = self.Retries.get(self.Retries.uniqueId == unique_id)

        except self.Retries.DoesNotExist:
            logger.debug("Creating retry record for %s ..." % unique_id)

            new_counter = self.Retries.create(
                uniqueId=unique_id,
                count=0,
                block=0,
                expires=None
            )

            logger.info("- Successfully created retry record")

            return new_counter

        else:
            logger.debug("Checking retry count for %s ..." % unique_id)

            if not counter.expires:
                counter_expires = 0
                expires = counter_expires
            else:
                counter_expires = counter.expires
                expires = counter_expires.timestamp()

            age = expires - datetime.now().timestamp()

            if counter.count >= ATTEMPTS and age >= 0:
                logger.error("Too many requests")
                raise TooManyRequests()
            elif counter.count == ATTEMPTS and age < 0:
                logger.debug("Resetting count for %s ..." % unique_id)

                upd_counter = self.Retries.update(
                    count=0
                ).where(
                    self.Retries.uniqueId == unique_id
                )

                upd_counter.execute()

                logger.info("- Successfully reset retry count")

            if counter.block >= BLOCKS and age >= 0:
                logger.error("Too many requests")
                raise TooManyRequests()
            elif counter.block == BLOCKS and age < 0:
                logger.debug("Resetting count for %s ..." % unique_id)

                upd_counter = self.Retries.update(
                    block=0
                ).where(
                    self.Retries.uniqueId == unique_id
                )

                upd_counter.execute()

                logger.info("- Successfully reset retry block")

            logger.info("- Found retry record")

            return counter

    def add_count(self, counter) -> str:
        """
        Add a retry count to the database.

        Args:
            counter: An instance of the Retries schema representing the retry count.

        Returns:
            str: A string representing the unique identifier for the retry count.
        """

        unique_id = counter.uniqueId
        count = counter.count
        block = counter.block

        logger.debug("Adding retry record for %s ..." % unique_id)

        if count+1 == ATTEMPTS and block+1 == BLOCKS:
            expires = datetime.now() + timedelta(milliseconds=BLOCKS_TIME)

            upd_counter = self.Retries.update(
                count=count+1,
                block=block+1,
                expires=expires
            ).where(
                self.Retries.uniqueId == unique_id
            )

            upd_counter.execute()

            logger.info("- Successfully added retry count")

        elif count+1 == ATTEMPTS and block < BLOCKS:
            expires = datetime.now() + timedelta(milliseconds=ATTEMPTS_TIME)

            upd_counter = self.Retries.update(
                count=count+1,
                block=block+1,
                expires=expires
            ).where(
                self.Retries.uniqueId == unique_id
            )

            upd_counter.execute()

            logger.info("- Successfully added retry count")

        elif count+1 < ATTEMPTS and block < BLOCKS:
            upd_counter = self.Retries.update(
                count=count+1
            ).where(
                self.Retries.uniqueId == unique_id
            )

            upd_counter.execute()

            logger.info("- Successfully added retry count")

    def delete_count(self, counter_id: int):
        """
        Delete a retry count from the database.

        Args:
            counter_id (int): An integer representing the ID of the retry count.

        Raises:
            Unauthorized: If the retry count with the given ID does not exist.
        """

        try:
            logger.debug("Finding retry record %s ..." % counter_id)

            counter = self.Retries.get(self.Retries.id == counter_id)

        except self.Retries.DoesNotExist:
            logger.error("No retry record %s found" % counter_id)

            raise Unauthorized()

        else:
            unique_id = counter.uniqueId

            logger.debug("deleting retry record for %s ..." % unique_id)

            counter.delete_instance()

            logger.info("- Successfully deleted retry count")
