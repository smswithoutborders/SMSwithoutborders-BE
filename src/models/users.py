import logging
from datetime import datetime, timedelta
import calendar

import requests
from peewee import DatabaseError
from phonenumbers.phonenumberutil import region_code_for_country_code
from phonenumbers import geocoder

from werkzeug.exceptions import Unauthorized
from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import TooManyRequests
from werkzeug.exceptions import InternalServerError

from SwobThirdPartyPlatforms import ImportPlatform, available_platforms

from src.schemas.db_connector import db
from src.schemas.users import Users
from src.schemas.usersinfo import UsersInfos
from src.schemas.retries import Retries
from src.schemas.wallets import Wallets
from src.schemas.sessions import Sessions

from src.security.data import Data


from settings import Configurations

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
    def __init__(self) -> None:
        """ """
        self.db = db
        self.Users = Users
        self.UsersInfos = UsersInfos
        self.Retries = Retries
        self.Data = Data
        self.Wallets = Wallets
        self.Sessions = Sessions

    def create(
        self, phone_number: str, country_code: str, name: str, password: str
    ) -> str:
        """ """
        try:
            data = self.Data()
            full_phone_number = country_code + phone_number
            phone_number_hash = data.hash(data=full_phone_number)

            logger.debug("Finding verified userinfo: %s" % phone_number_hash)

            result = []

            userinfos = (
                self.UsersInfos.select()
                .where(
                    self.UsersInfos.full_phone_number == phone_number_hash,
                    self.UsersInfos.status == "verified",
                )
                .dicts()
            )

            for userinfo in userinfos:
                result.append(userinfo)

            # check for duplicate user
            if len(result) > 1:
                logger.error("Duplicate verified users found: %s" % phone_number_hash)
                raise Conflict()

            logger.info("- Successfully found verified users: %s" % phone_number_hash)

            # check for no user
            if len(result) < 1:
                logger.debug("creating user '%s' ..." % phone_number_hash)

                data = self.Data()
                password_hash = data.hash(password)

                new_user = self.Users.create(password=password_hash)

                self.UsersInfos.create(
                    name=data.encrypt(data=name),
                    country_code=data.encrypt(data=country_code),
                    full_phone_number=phone_number_hash,
                    userId=new_user.id,
                )

                logger.info("- User '%s' successfully created" % phone_number_hash)
                return str(new_user.id)
            else:
                logger.error("user '%s' already has an acount" % phone_number_hash)
                raise Conflict()

        except DatabaseError as err:
            logger.error("creating user '%s' failed check logs" % full_phone_number)
            raise InternalServerError(err)

    def verify(
        self, password: str, phone_number: str = None, user_id: str = None
    ) -> dict:
        """ """
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
                        self.UsersInfos.status == "verified",
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
                    logger.error(
                        "Duplicate verified users found: %s" % phone_number_hash
                    )
                    raise Conflict()

                logger.debug("Verifying password for user: %s" % phone_number_hash)

                users = (
                    self.Users.select()
                    .where(
                        self.Users.id == userinfos[0]["userId"],
                        self.Users.password == password_hash,
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
                    logger.error("Duplicate users found: %s" % phone_number_hash)
                    raise Conflict()

                if ENABLE_BLOCKING:
                    self.delete_count(counter_id=counter.id)

                update_login = self.Users.update(
                    last_login=users[0]["current_login"], current_login=datetime.now()
                ).where(self.Users.id == userinfos[0]["userId"])

                update_login.execute()

                logger.info(
                    "- Successfully found verified user: %s" % phone_number_hash
                )
                return userinfos[0]

            elif user_id:
                if ENABLE_BLOCKING:
                    counter = self.check_count(unique_id=user_id)

                logger.debug("Verifying user: %s" % user_id)

                userinfos = (
                    self.UsersInfos.select()
                    .where(
                        self.UsersInfos.userId == user_id,
                        self.UsersInfos.status == "verified",
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
                    logger.error("Duplicate verified users found: %s" % user_id)
                    raise Conflict()

                logger.debug("Verifying password for user: %s" % user_id)

                users = (
                    self.Users.select()
                    .where(
                        self.Users.id == userinfos[0]["userId"],
                        self.Users.password == password_hash,
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
        """ """
        try:
            data = self.Data()

            if phone_number:
                phone_number_hash = data.hash(phone_number)

                logger.debug("finding user: %s" % phone_number_hash)

                userinfos = (
                    self.UsersInfos.select()
                    .where(
                        self.UsersInfos.full_phone_number == phone_number_hash,
                        self.UsersInfos.status == "verified",
                    )
                    .dicts()
                )

                # check for no user
                if len(userinfos) < 1:
                    logger.error("Invalid Phone number")
                    raise Unauthorized()

                # check for duplicate user
                if len(userinfos) > 1:
                    logger.error(
                        "Duplicate verified users found: %s" % phone_number_hash
                    )
                    raise Conflict()

                logger.info(
                    "- Successfully found verified user: %s" % phone_number_hash
                )
                return userinfos[0]

            elif user_id:
                logger.debug("finding user: %s" % user_id)

                userinfos = (
                    self.UsersInfos.select()
                    .where(
                        self.UsersInfos.userId == user_id,
                        self.UsersInfos.status == "verified",
                    )
                    .dicts()
                )

                # check for no user
                if len(userinfos) < 1:
                    logger.error("Invalid User Id")
                    raise Unauthorized()

                # check for duplicate user
                if len(userinfos) > 1:
                    logger.error("Duplicate verified users found: %s" % user_id)
                    raise Conflict()

                logger.info("- Successfully found verified user: %s" % user_id)

                user = (
                    self.Users.select(self.Users.createdAt, self.Users.last_login)
                    .where(self.Users.id == userinfos[0]["userId"])
                    .dicts()
                )

                # check for no user
                if len(user) < 1:
                    logger.error("Invalid User Id")
                    raise Unauthorized()

                # check for duplicate user
                if len(user) > 1:
                    logger.error("Duplicate verified users found: %s" % user_id)
                    raise Conflict()

                return {
                    "userinfo": userinfos[0],
                    "createdAt": user[0]["createdAt"],
                    "last_login": user[0]["last_login"],
                }

        except DatabaseError as err:
            logger.error("Failed finding user check logs")
            raise InternalServerError(err)

    def find_platform(self, user_id: str) -> UserPlatformObject:
        """ """
        try:
            saved_platforms = []

            user_platforms = {"unsaved_platforms": [], "saved_platforms": []}

            logger.debug("Fetching saved platforms for %s ..." % user_id)

            saved_wallet_platform = (
                self.Wallets.select().where(self.Wallets.userId == user_id).dicts()
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
                    "letter": platform_info["letter"],
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
                        "letter": platform_info["letter"],
                    }

                    user_platforms["unsaved_platforms"].append(result)

            logger.info("- Successfully Fetched users platforms")

            return user_platforms

        except DatabaseError as err:
            logger.error("Failed fetching users platforms check logs")
            raise InternalServerError(err)

    def update(self, user_id: str, status: str = None, password: str = None) -> None:
        """ """
        try:
            logger.debug("Finding userinfo with user_id: %s" % user_id)

            result = []

            userinfos = (
                self.UsersInfos.select()
                .where(self.UsersInfos.userId == user_id)
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
                logger.error("Duplicate users found with user_id: %s" % user_id)
                raise Conflict()

            logger.info("- Successfully found user with user_id: %s" % user_id)

            if status:
                logger.debug(
                    "updating userinfo status with user_id: '%s' ..." % user_id
                )

                upd_userinfo = self.UsersInfos.update(status=status).where(
                    self.UsersInfos.userId == result[0]["userId"],
                    self.UsersInfos.id == result[0]["id"],
                )

                upd_userinfo.execute()

                logger.info("- User status '%s' successfully updated" % user_id)

            elif password:
                logger.debug("updating user password with user_id: '%s' ..." % user_id)

                upd_user = self.Users.update(password=password).where(
                    self.Users.id == result[0]["userId"]
                )

                upd_user.execute()

                logger.info("- User password '%s' successfully updated" % user_id)

        except DatabaseError as err:
            logger.error("updating user '%s' failed check logs" % user_id)
            raise InternalServerError(err)

    def delete(self, user_id: str) -> None:
        """ """
        try:
            logger.debug("Finding userinfo with user_id: %s" % user_id)

            userinfos = self.UsersInfos.select().where(
                self.UsersInfos.userId == user_id
            )

            # check for no user
            if len(userinfos) < 1:
                logger.error("Userinfo with user_id '%s' not found" % user_id)
                raise Unauthorized()

            # check for duplicate user
            if len(userinfos) > 1:
                logger.error("Duplicate users found with user_id: %s" % user_id)
                raise Conflict()

            user = self.Users.select().where(self.Users.id == userinfos[0].userId)

            logger.info("- Successfully found user with user_id: %s" % user_id)

            logger.debug("deleting userinfo with user_id: '%s' ..." % user_id)

            userinfos[0].delete_instance()
            user[0].delete_instance()

            logger.info("- User account '%s' successfully deleted" % user_id)

        except DatabaseError as err:
            logger.error("deleting user '%s' failed check logs" % user_id)
            raise InternalServerError(err)

    def recaptcha(self, captchaToken: str, remoteIp: str) -> bool:
        """ """
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
        """ """
        try:
            logger.debug("Finding retry record for %s ..." % unique_id)

            counter = self.Retries.get(self.Retries.uniqueId == unique_id)

        except self.Retries.DoesNotExist:
            logger.debug("Creating retry record for %s ..." % unique_id)

            new_counter = self.Retries.create(
                uniqueId=unique_id, count=0, block=0, expires=None
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

                upd_counter = self.Retries.update(count=0).where(
                    self.Retries.uniqueId == unique_id
                )

                upd_counter.execute()

                logger.info("- Successfully reset retry count")

            if counter.block >= BLOCKS and age >= 0:
                logger.error("Too many requests")
                raise TooManyRequests()
            elif counter.block == BLOCKS and age < 0:
                logger.debug("Resetting count for %s ..." % unique_id)

                upd_counter = self.Retries.update(block=0).where(
                    self.Retries.uniqueId == unique_id
                )

                upd_counter.execute()

                logger.info("- Successfully reset retry block")

            logger.info("- Found retry record")

            return counter

    def add_count(self, counter) -> str:
        """ """
        unique_id = counter.uniqueId
        count = counter.count
        block = counter.block

        logger.debug("Adding retry record for %s ..." % unique_id)

        if count + 1 == ATTEMPTS and block + 1 == BLOCKS:
            expires = datetime.now() + timedelta(milliseconds=BLOCKS_TIME)

            upd_counter = self.Retries.update(
                count=count + 1, block=block + 1, expires=expires
            ).where(self.Retries.uniqueId == unique_id)

            upd_counter.execute()

            logger.info("- Successfully added retry count")

        elif count + 1 == ATTEMPTS and block < BLOCKS:
            expires = datetime.now() + timedelta(milliseconds=ATTEMPTS_TIME)

            upd_counter = self.Retries.update(
                count=count + 1, block=block + 1, expires=expires
            ).where(self.Retries.uniqueId == unique_id)

            upd_counter.execute()

            logger.info("- Successfully added retry count")

        elif count + 1 < ATTEMPTS and block < BLOCKS:
            upd_counter = self.Retries.update(count=count + 1).where(
                self.Retries.uniqueId == unique_id
            )

            upd_counter.execute()

            logger.info("- Successfully added retry count")

    def delete_count(self, counter_id: int):
        """ """
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

    def get_analytics(self, start: str, end: str, _type: str, _format: str) -> dict:
        """ """
        try:
            data = self.Data()

            logger.debug("[*] Start: %s", start)
            logger.debug("[*] End: %s", end)
            logger.debug("[*] Type: %s", _type)
            logger.debug("[*] Format: %s", _format)

            result = {"total_users": 0, "total_countries": 0}

            start = datetime.strptime(start, "%Y-%m-%d").date()
            end = datetime.strptime(end, "%Y-%m-%d").date()

            if _type == "signup":
                if _format == "month":
                    new_start = datetime(start.year, start.month, 1, 0, 0, 0)
                    new_end = datetime(
                        end.year,
                        end.month,
                        calendar.monthrange(end.year, end.month)[1],
                        23,
                        59,
                        59,
                    )

                    sessions = (
                        self.Sessions.select(
                            self.Sessions.createdAt, self.Sessions.type
                        )
                        .where(
                            self.Sessions.status == "verified",
                            self.Sessions.type == "signup",
                            self.Sessions.createdAt.between(new_start, new_end),
                        )
                        .order_by(self.Sessions.createdAt.asc())
                    )

                    for session in sessions.iterator():
                        session_date = session.createdAt
                        month_name = calendar.month_name[session_date.month]

                        if not result.get(str(session_date.year)):
                            result[str(session_date.year)] = []

                        if any(month_name in x for x in result[str(session_date.year)]):
                            for x in result[str(session_date.year)]:
                                if x[0] == month_name:
                                    x[1] += 1
                        else:
                            result[str(session_date.year)].append([month_name, 1])

                    result["total_users"] = len(sessions)

                    logger.info("- Success!")

                elif _format == "day":
                    new_start = datetime(start.year, start.month, start.day, 0, 0, 0)
                    new_end = datetime(end.year, end.month, end.day, 23, 59, 59)

                    sessions = (
                        self.Sessions.select(
                            self.Sessions.createdAt, self.Sessions.type
                        )
                        .where(
                            self.Sessions.status == "verified",
                            self.Sessions.type == "signup",
                            self.Sessions.createdAt.between(new_start, new_end),
                        )
                        .order_by(self.Sessions.createdAt.asc())
                    )

                    for session in sessions.iterator():
                        session_date = session.createdAt
                        day_name = session_date.strftime("%c")

                        if not result.get(str(session_date.year)):
                            result[str(session_date.year)] = []

                        if any(day_name in x for x in result[str(session_date.year)]):
                            for x in result[str(session_date.year)]:
                                if x[0] == day_name:
                                    x[1] += 1
                        else:
                            result[str(session_date.year)].append([day_name, 1])

                    result["total_users"] = len(sessions)

                    logger.info("- Success!")

                else:
                    logger.error("[x] Invalid format '%s'", _format)
                    raise BadRequest()

            elif _type == "available":
                if _format == "month":
                    new_start = datetime(1970, 1, 1, 0, 0, 0)
                    new_end = datetime(
                        end.year,
                        end.month,
                        calendar.monthrange(end.year, end.month)[1],
                        23,
                        59,
                        59,
                    )

                    usersinfos = (
                        self.UsersInfos.select(
                            self.UsersInfos.createdAt,
                            self.UsersInfos.country_code,
                            self.UsersInfos.iv,
                        )
                        .where(
                            self.UsersInfos.status == "verified",
                            self.UsersInfos.createdAt.between(new_start, new_end),
                        )
                        .order_by(self.UsersInfos.createdAt.asc())
                    )

                    for usersinfo in usersinfos.iterator():
                        usersinfo_date = usersinfo.createdAt
                        month_name = calendar.month_name[usersinfo_date.month]

                        if not result.get(str(usersinfo_date.year)):
                            result[str(usersinfo_date.year)] = []

                        if any(
                            month_name in x for x in result[str(usersinfo_date.year)]
                        ):
                            for x in result[str(usersinfo_date.year)]:
                                if x[0] == month_name:
                                    x[1] += 1
                        else:
                            result[str(usersinfo_date.year)].append([month_name, 1])

                        country_prefix = int(data.decrypt(data=usersinfo.country_code))
                        region_code = region_code_for_country_code(country_prefix)
                        country_name = geocoder._region_display_name(region_code, "en")

                        if not result.get("countries"):
                            result["countries"] = []

                        if any(country_name in x for x in result["countries"]):
                            for x in result["countries"]:
                                if x[0] == country_name and x[1] == region_code:
                                    x[2] += 1
                        else:
                            result["countries"].append([country_name, region_code, 1])

                    result["total_users"] = len(usersinfos)
                    result["total_countries"] = len(result["countries"])

                    logger.info("- Success!")

                elif _format == "day":
                    new_start = datetime(1970, 1, 1, 0, 0, 0)
                    new_end = datetime(end.year, end.month, end.day, 23, 59, 59)

                    usersinfos = (
                        self.UsersInfos.select(
                            self.UsersInfos.createdAt,
                            self.UsersInfos.country_code,
                            self.UsersInfos.iv,
                        )
                        .where(
                            self.UsersInfos.status == "verified",
                            self.UsersInfos.createdAt.between(new_start, new_end),
                        )
                        .order_by(self.UsersInfos.createdAt.asc())
                    )

                    for usersinfo in usersinfos.iterator():
                        usersinfo_date = usersinfo.createdAt
                        day_name = usersinfo_date.strftime("%c")

                        if not result.get(str(usersinfo_date.year)):
                            result[str(usersinfo_date.year)] = []

                        if any(day_name in x for x in result[str(usersinfo_date.year)]):
                            for x in result[str(usersinfo_date.year)]:
                                if x[0] == day_name:
                                    x[1] += 1
                        else:
                            result[str(usersinfo_date.year)].append([day_name, 1])

                        country_prefix = int(data.decrypt(data=usersinfo.country_code))
                        region_code = region_code_for_country_code(country_prefix)
                        country_name = geocoder._region_display_name(region_code, "en")

                        if not result.get("countries"):
                            result["countries"] = []

                        if any(country_name in x for x in result["countries"]):
                            for x in result["countries"]:
                                if x[0] == country_name and x[1] == region_code:
                                    x[2] += 1
                        else:
                            result["countries"].append([country_name, region_code, 1])

                    result["total_users"] = len(usersinfos)
                    result["total_countries"] = len(result["countries"])

                    logger.info("- Success!")

                else:
                    logger.error("[x] Invalid format '%s'", _format)
                    raise BadRequest()

            else:
                logger.error("[x] Invalid type '%s'", _type)
                raise BadRequest()

            return result

        except DatabaseError as err:
            logger.error("FAILED TO FETCH STATISTICS. See logs below")
            raise InternalServerError(err)
