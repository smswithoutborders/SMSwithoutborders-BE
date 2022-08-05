import logging
logger = logging.getLogger(__name__)

from Configs import baseConfig

config = baseConfig()
twilio = config["TWILIO"]

from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

account_sid = twilio["ACCOUNT_SID"]
auth_token = twilio["AUTH_TOKEN"]
service_sid = twilio["SERVICE_SID"]

from werkzeug.exceptions import InternalServerError
from werkzeug.exceptions import Forbidden

SMSObject = ()

class OTP_Model:
    def __init__(self, phone_number) -> None:
        """
        """
        self.client = Client(account_sid, auth_token)
        self.phone_number = phone_number

    def verification(self) -> SMSObject:
        """
        """
        try:
            logger.debug("Starting OTP verification ...")

            verification = self.client.verify \
                        .v2 \
                        .services(service_sid) \
                        .verifications \
                        .create(to=self.phone_number, channel='sms')

            logger.info("- OTP verification complete")

            return verification

        except Exception as error:
            raise InternalServerError(error)

    def verification_check(self, code: str) -> SMSObject:
        """
        """
        try:
            logger.debug("Starting OTP verification ...")

            verification_check = self.client.verify \
                        .v2 \
                        .services(service_sid) \
                        .verification_checks \
                        .create(to=self.phone_number, code=code)

            logger.info("- OTP verification complete")

            return verification_check

        except TwilioRestException as error:
            logger.exception(error)
            raise Forbidden()

        except Exception as error:
            raise InternalServerError(error)