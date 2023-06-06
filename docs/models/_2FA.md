# OTP Verification Documentation

This is a documentation for the `OTP_Model` class that provides functionality for OOTP (One Time Password) verification using the Twilio service. The class includes methods for OTP verification, checking the count of OTP resend, adding to the resend count, and deleting a resend record.

## Table of Contents

- [Requirements](#requirements)
- [Configuration](#configuration)

## Required Libraries

The following libraries are imported in the code:

```python
import logging
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from datetime import datetime, timedelta
from werkzeug.exceptions import InternalServerError, Forbidden, TooManyRequests
```

## Configuration

Before using the OTP_Model class, some configurations need to be set. These configurations are imported from a settings module. The required configurations are:

- `TWILIO_ACCOUNT_SID`: Twilio account SID for authentication.
- `TWILIO_AUTH_TOKEN`: Twilio authentication token.
- `TWILIO_SERVICE_SID`: Twilio service SID.
- `FIRST_RESEND_DURATION`: Duration (in milliseconds) for the first OTP resend.
- `SECOND_RESEND_DURATION`: Duration (in milliseconds) for the second OTP resend.
- `THIRD_RESEND_DURATION`: Duration (in milliseconds) for the third OTP resend.
- `FOURTH_RESEND_DURATION`: Duration (in milliseconds) for the fourth OTP resend.

## OTP_Model Class

### Initialization

The `OTP_Model` class is initialized with a `phone_number` parameter. The class constructor sets up the Twilio client using the provided account SID and authentication token.

