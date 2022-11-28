import os

MODE = os.environ.get("MODE")

if MODE and MODE.lower() == "production":
    class production:
        SSL_PORT = os.environ["SSL_PORT"]
        SSL_CERTIFICATE = os.environ["SSL_CERTIFICATE"]
        SSL_KEY = os.environ["SSL_KEY"]
        SSL_PEM = os.environ["SSL_PEM"]

        SECURE_COOKIE = True

    baseConfig = production

else:
    class development:
        SSL_PORT = os.environ.get("SSL_PORT") 
        SSL_CERTIFICATE = os.environ.get("SSL_CERTIFICATE") or "" 
        SSL_KEY = os.environ.get("SSL_KEY") or "" 
        SSL_PEM = os.environ.get("SSL_PEM") or "" 

        SECURE_COOKIE = False
    
    baseConfig = development

class Configurations(baseConfig):
    MYSQL_HOST = os.environ.get("MYSQL_HOST")
    MYSQL_USER = os.environ.get("MYSQL_USER")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD")
    MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE")

    COOKIE_NAME = "SWOB"
    COOKIE_MAXAGE = 7200000 #ms 2hrs

    ENABLE_BLOCKING = True
    SHORT_BLOCK_ATTEMPTS = 5
    LONG_BLOCK_ATTEMPTS = 3 
    SHORT_BLOCK_DURATION = 15 #min
    LONG_BLOCK_DURATION = 1440 #min 24hrs

    ENABLE_OTP = True
    FIRST_RESEND_DURATION = 120000 #ms 2min
    SECOND_RESEND_DURATION = 300000 #ms 5min
    THIRD_RESEND_DURATION = 900000 #ms 15min
    FOURTH_RESEND_DURATION = 86400000 #ms 24hrs

    HOST = os.environ.get("HOST")
    PORT = os.environ.get("PORT")
    ORIGINS = os.environ.get("ORIGINS")

    TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
    TWILIO_SERVICE_SID = os.environ.get("TWILIO_SERVICE_SID")

    ENABLE_RECAPTCHA = False if (os.environ.get("ENABLE_RECAPTCHA") or "False").lower() == "false" else True if (os.environ.get("ENABLE_RECAPTCHA") or "False").lower() == "true" else False
    RECAPTCHA_SECRET_KEY = os.environ.get("RECAPTCHA_SECRET_KEY")