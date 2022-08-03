import logging
logger = logging.getLogger(__name__)

from peewee import IntegrityError
from peewee import DatabaseError

from schemas.users import Users
from schemas.usersinfo import UsersInfos

from security.data import Data

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import InternalServerError

UserObject = ()

class User_Model:
    def __init__(self) -> None:
        """
        """
        self.Users = Users
        self.UsersInfos = UsersInfos
        self.Data = Data

    def create(self, phone_number: str, country_code: str, name: str, password: str) -> str:
        """
        """
        try:
            try:
                data = self.Data()
                full_phone_number = country_code+phone_number
                phone_number_hash = data.hash(data=full_phone_number)

                self.UsersInfos.get(self.UsersInfos.full_phone_number == phone_number_hash, self.UsersInfos.status == "verified")
            except self.UsersInfos.DoesNotExist:
                logger.debug("creating user '%s' ..." % phone_number)

                data = self.Data()
                password_hash = data.hash(password)

                new_user = self.Users.create(
                    password = password_hash
                )

                self.UsersInfos.create(
                    name = data.encrypt(data=name)["e_data"],
                    country_code = data.encrypt(data=country_code)["e_data"],
                    full_phone_number = phone_number_hash,
                    userId= new_user.id,
                    iv = data.iv
                )

                logger.info("- User '%s' successfully created" % full_phone_number)
                return str(new_user.id)
            else:
                logger.error("user '%s' already has an acount" % full_phone_number)
                raise Conflict()

        except DatabaseError as err:
            logger.error("creating user '%s' failed check logs" % full_phone_number)
            raise InternalServerError(err)

    def find(self, phone_number: str = None, id: str = None) -> UserObject:
        """
        """
        try:
            if phone_number:
                try:
                    data = self.Data()
                    phone_number_hash = data.hash(data=phone_number)

                    user = self.UsersInfos.get(self.UsersInfos.full_phone_number == phone_number_hash, self.UsersInfos.status == "verified")
                except self.UsersInfos.DoesNotExist:
                    logger.error("No user with phone_number '%s' found" % phone_number)
                    return None
                else:
                    logger.info("- Successfully found user with phone_number '%s'" % phone_number)

                    return user

        except DatabaseError as err:
            logger.error("Failed finding user check logs")
            raise InternalServerError(err)