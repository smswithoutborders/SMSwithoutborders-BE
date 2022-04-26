import logging
logger = logging.getLogger(__name__)

import requests
import json

from error import InternalServerError
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

class OAuth2:
    def __init__(self, credentials, scopes):
        self.credentials = credentials
        self.scopes = scopes

    def init(self, originalUrl):
        try:
            flow = Flow.from_client_secrets_file(
                self.credentials,
                scopes = self.scopes,
                redirect_uri = f'{originalUrl}platforms/gmail/protocols/oauth2/redirect_codes/'
            )

            auth_uri = flow.authorization_url()
            return auth_uri[0]
        except HttpError as error:
            logger.error('Google-client lib error at init')
            raise InternalServerError(error)
        except Exception as error:
            logger.error('Gmail-OAuth2-init failed')
            return InternalServerError(error)

    def validate(self, originalUrl, code):
        try:
            flow = Flow.from_client_secrets_file(
                self.credentials,
                scopes = self.scopes,
                redirect_uri = f'{originalUrl}platforms/gmail/protocols/oauth2/redirect_codes/'
            )

            flow.fetch_token(code=code)
            credentials = flow.credentials

            user_info_service = build('oauth2', 'v2', credentials=credentials)
            user_info = user_info_service.userinfo().get().execute()
            return {
                "profile": user_info,
                "token": credentials.to_json()
            }
        except HttpError as error:
            logger.error('Google-client lib error at validate')
            raise InternalServerError(error)
        except Exception as error:
            logger.error('Gmail-OAuth2-validate failed')
            return InternalServerError(error)

    def revoke(self, token):
        try:
            credentials = json.loads(token)
            credentials = Credentials.from_authorized_user_info(credentials, self.scopes)

            # If there are no (valid) credentials available, let the user log in.
            if not credentials or not credentials.valid:
                if credentials and credentials.expired and credentials.refresh_token:
                    credentials.refresh(Request())
            
            revoke = requests.post('https://oauth2.googleapis.com/revoke', params={'token': credentials.token}, headers = {'content-type': 'application/x-www-form-urlencoded'})

            status_code = getattr(revoke, 'status_code')
            if status_code == 200:
                return True
            else:
                raise Exception(getattr(revoke, 'reason'))
        except HttpError as error:
            logger.error('Google-client lib error at revoke')
            raise InternalServerError(error)
        except Exception as error:
            logger.error('Gmail-OAuth2-revoke failed')
            return InternalServerError(error)