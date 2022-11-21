import logging
import argparse
import sys

from peewee import DatabaseError

from src.schemas.usersinfo import UsersInfos
from src.schemas.users import Users
from src.security.data import Data

logger = logging.getLogger(__name__)

def create(user_id: str, phone_number: str, country_code: str, name: str, password: str) -> None:
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

        logger.info("- Successfully found verified users: %s" % phone_number_hash)

        # check for no user
        if len(result) < 1:
            logger.debug("creating user '%s' ..." % phone_number_hash)

            data = Data()
            password_hash = data.hash(password)

            new_user = Users.create(
                id = user_id,
                password = password_hash
            )

            UsersInfos.create(
                name = data.encrypt(data=name)["e_data"],
                country_code = data.encrypt(data=country_code)["e_data"],
                full_phone_number = phone_number_hash,
                userId= new_user.id,
                status="verified",
                iv = data.iv
            )

            logger.info("- User '%s' successfully created" % phone_number_hash)

            return None
        else:
            error = "user '%s' already has an acount" % phone_number_hash
            logger.error(error)
            sys.exit(1)
            
    except DatabaseError as err:
        raise err

def main():
    """
    """
    user_id="dead3662-5f78-11ed-b8e7-6d06c3aaf3c6"
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
                user_id=user_id,
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
