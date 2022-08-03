import logging
logger = logging.getLogger(__name__)

from Configs import baseConfig

config = baseConfig()
twilio = config["TWILIO"]

from twilio.rest import Client

account_sid = twilio["ACCOUNT_SID"]
auth_token = twilio["AUTH_TOKEN"]
service_sid = twilio["SERVICE_SID"]

from werkzeug.exceptions import InternalServerError

class OTP_Model:
    def __init__(self) -> None:
        """
        """
        self.client = Client(account_sid, auth_token)

    def verification(self, phone_number: str) -> str:
        """
        """
        try:
            logger.debug("Starting OTP verification ...")

            verification = self.client.verify \
                        .v2 \
                        .services(service_sid) \
                        .verifications \
                        .create(to=phone_number, channel='sms')

            logger.info("- OTP verification complete")

            return verification.status

        except Exception as error:
            raise InternalServerError(error)

    def verification_check(self, phone_number: str, code: str) -> str:
        """
        """
        try:
            logger.debug("Starting OTP verification ...")

            verification_check = self.client.verify \
                        .v2 \
                        .services(service_sid) \
                        .verification_checks \
                        .create(to=phone_number, code=code)

            logger.info("- OTP verification complete")

            return verification_check.status

        except Exception as error:
            raise InternalServerError(error)