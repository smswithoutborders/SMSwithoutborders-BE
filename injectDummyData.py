import logging
import argparse
import sys

from peewee import DatabaseError

from src.schemas.usersinfo import UsersInfos
from src.schemas.users import Users
from src.security.data import Data

logger = logging.getLogger(__name__)

def create(phone_number: str, country_code: str, name: str, password: str) -> None:
    """
    """
    try:
        data = Data()
        full_phone_number = country_code+phone_number
        phone_number_hash = data.hash(data=full_phone_number)

        logger.debug("Finding verified userinfo: %s" % phone_number_hash)

        result = []

        userinfos = (
            UsersInfos.select()
            .where(
                UsersInfos.full_phone_number == phone_number_hash,
                UsersInfos.status == "verified"
            )
            .dicts()
        )

        for userinfo in userinfos:
            result.append(userinfo)

        # check for duplicate user
        if len(result) > 1:
            error = "Duplicate verified users found: %s" % phone_number_hash
            logger.error(error)
            sys.exit(1)

        # check for no user
        if len(result) < 1:
            logger.info("creating user '%s' ..." % phone_number_hash)

            data = Data()
            password_hash = data.hash(password)

            new_user = Users.create(
                password = password_hash
            )

            UsersInfos.create(
                name = data.encrypt(data=name),
                country_code = data.encrypt(data=country_code),
                full_phone_number = phone_number_hash,
                userId= new_user.id,
                status="verified",
            )

            logger.info("- User '%s' successfully created \n" % phone_number_hash)
            logger.info("- User ID = '%s'" % new_user.id)
            logger.info("- Password = '%s'" % password)
            logger.info("- Name = '%s'" % name)
            logger.info("- Phone NUmber = '%s%s'" % (country_code, phone_number))

            return None
        else:
            error = "user '%s' already has an acount \n" % phone_number_hash
            logger.error(error)
            logger.info("- User ID = '%s'" % result[0]["userId"])
            logger.info("- Password = '%s'" % password)
            logger.info("- Name = '%s'" % name)
            logger.info("- Phone NUmber = '%s%s'" % (country_code, phone_number))
            return None
            
    except DatabaseError as err:
        raise err

def main():
    """
    """
    phone_number="123456789"
    country_code="+237"
    name="dummy_user"
    password="dummy_password" 

    parser = argparse.ArgumentParser()
    parser.add_argument("--user", help="Inject dummy user", action="store_true")
    args = parser.parse_args()

    try:
        if args.user:

            create(
                phone_number=phone_number,
                country_code=country_code,
                name=name,
                password=password 
            )
          
            sys.exit(0)

    except Exception as error:
        logging.error(str(error))
        sys.exit(1)

if __name__ == "__main__":

    logging.basicConfig(level="INFO")
    main()
