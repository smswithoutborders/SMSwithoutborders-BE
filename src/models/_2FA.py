from werkzeug.exceptions import TooManyRequests
from werkzeug.exceptions import Forbidden
from werkzeug.exceptions import InternalServerError
from datetime import timedelta
from datetime import datetime
from src.schemas.svretries import Svretries
from settings import Configurations
import logging

from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

logger = logging.getLogger(__name__)

# configurations
twilio_account_sid = Configurations.TWILIO_ACCOUNT_SID
twilio_auth_token = Configurations.TWILIO_AUTH_TOKEN
twilio_service_sid = Configurations.TWILIO_SERVICE_SID
duration_1 = Configurations.FIRST_RESEND_DURATION
duration_2 = Configurations.SECOND_RESEND_DURATION
duration_3 = Configurations.THIRD_RESEND_DURATION
duration_4 = Configurations.FOURTH_RESEND_DURATION


SMSObject = ()


class OTP_Model:
    """
    This class implements a model for One-Time Password (OTP) verification
    using the Twilio Verify API.
    """

    def __init__(self, phone_number: str) -> None:
        """Initializes an OTP_Model instance.

        Args:
            phone_number (str): The phone number to send OTPs to.
        """
        self.client = Client(twilio_account_sid, twilio_auth_token)
        self.phone_number = phone_number
        self.Svretries = Svretries

    def verification(self) -> SMSObject:
        """
        Starts an OTP verification process using the Twilio Verify API.

        Returns:
            SMSObject: An object representing the Twilio verification process.
        """
        try:
            logger.debug("Starting OTP verification ...")

            verification = self.client.verify \
                .v2 \
                .services(twilio_service_sid) \
                .verifications \
                .create(to=self.phone_number, channel='sms')

            logger.info("- OTP verification complete")

            return verification

        except Exception as error:
            raise InternalServerError(error)

    def verification_check(self, code: str) -> SMSObject:
        """
        Checks an OTP verification code using the Twilio Verify API.

        Args:
            code (str): The OTP verification code to check.

        Returns:
            SMSObject: An object representing the result of the Twilio verification
            check.
        """
        try:
            logger.debug("Starting OTP verification ...")

            verification_check = self.client.verify \
                .v2 \
                .services(twilio_service_sid) \
                .verification_checks \
                .create(to=self.phone_number, code=code)

            logger.info("- OTP verification complete")

            return verification_check

        except TwilioRestException as error:
            logger.exception(error)
            raise Forbidden()

        except Exception as error:
            raise InternalServerError(error)

    def check_count(self, unique_id: str, user_id: str):
        """
        Checks the number of OTP verification attempts for a user.

        Args:
            unique_id (str): A unique identifier for the verification attempt.
            user_id (str): The user ID associated with the verification attempt.

        Returns:
            src.schemas.svretries.Svretries: A database model instance representing
            the number of OTP verification attempts for the user.
        """
        try:
            logger.debug("Finding SMS resend record for %s using %s ..." %
                         (user_id, unique_id))

            counter = self.Svretries.get(
                self.Svretries.userId == user_id, self.Svretries.uniqueId == unique_id)

        except self.Svretries.DoesNotExist:
            logger.debug("Creating SMS resend record for %s using %s ..." % (
                user_id, unique_id))

            new_counter = self.Svretries.create(
                uniqueId=unique_id,
                userId=user_id,
                count=0,
                expires=None
            )

            logger.info("- Successfully created SMS resend record")

            return new_counter

        else:
            logger.debug("Checking SMS resend record for %s using %s ..." % (
                user_id, unique_id))

            expires = counter.expires

            if expires:
                age = expires.timestamp() - datetime.now().timestamp()
            else:
                age = -1

            if age >= 0:
                logger.error("Too many requests")
                raise TooManyRequests()
            elif counter.count == 4 and age < 0:
                logger.debug("Resetting count ...")

                upd_counter = self.Svretries.update(
                    count=0
                ).where(
                    self.Svretries.uniqueId == unique_id,
                    self.Svretries.userId == user_id
                )

                upd_counter.execute()

                logger.info("- Successfully reset SMS resend count")

            logger.info("- Found SMS resend count")

            return counter

    def add_count(self, counter) -> str:
        """
        Adds to the count of verification attempts and updates the expiry date
        for a user's OTP verification.

        Args:
            counter (src.schemas.svretries.Svretries): A database record instance representing
            the number of OTP verification attempts for the user.

        Returns:
            str: A timestamp representing the expiry date for the user's OTP verification.
        """

        unique_id = counter.uniqueId
        user_id = counter.userId
        count = counter.count

        logger.debug("Adding SMS resend record for %s using %s ..." %
                     (user_id, unique_id))

        if count+1 == 1:
            expires = datetime.now() + timedelta(milliseconds=duration_1)

            upd_counter = self.Svretries.update(
                count=count+1,
                expires=expires
            ).where(
                self.Svretries.uniqueId == unique_id,
                self.Svretries.userId == user_id
            )

            upd_counter.execute()

            logger.info("- Successfully added SMS resend count")

            return expires.timestamp()
        elif count+1 == 2:
            expires = datetime.now() + timedelta(milliseconds=duration_2)

            upd_counter = self.Svretries.update(
                count=count+1,
                expires=expires
            ).where(
                self.Svretries.uniqueId == unique_id,
                self.Svretries.userId == user_id
            )

            upd_counter.execute()

            logger.info("- Successfully added SMS resend count")

            return expires.timestamp()
        elif count+1 == 3:
            expires = datetime.now() + timedelta(milliseconds=duration_3)

            upd_counter = self.Svretries.update(
                count=count+1,
                expires=expires
            ).where(
                self.Svretries.uniqueId == unique_id,
                self.Svretries.userId == user_id
            )

            upd_counter.execute()

            logger.info("- Successfully added SMS resend count")

            return expires.timestamp()
        elif count+1 == 4:
            expires = datetime.now() + timedelta(milliseconds=duration_4)

            upd_counter = self.Svretries.update(
                count=count+1,
                expires=expires
            ).where(
                self.Svretries.uniqueId == unique_id,
                self.Svretries.userId == user_id
            )

            upd_counter.execute()

            logger.info("- Successfully added SMS resend count")

            return expires.timestamp()

    def delete_count(self, counter_id: int):
        """
        Deletes the SMS resend record counter

        Args:
          counter_id (int): An integer which identifies the counter for a given retry record
        """
        try:
            logger.debug("Finding SMS resend record %s ..." % counter_id)

            counter = self.Svretries.get(self.Svretries.id == counter_id)

        except self.Svretries.DoesNotExist:
            logger.error("No SMS resend record %s found" % counter_id)

            raise Forbidden()

        else:
            unique_id = counter.uniqueId
            user_id = counter.userId

            logger.debug("deleting SMS resend record for %s using %s ..." % (
                user_id, unique_id))

            counter.delete_instance()

            logger.info("- Successfully deleted SMS resend count")
