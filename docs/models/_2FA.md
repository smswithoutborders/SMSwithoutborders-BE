# OTP Verification Module

The `OTP_Model` class the provides functionality for OTP (One Time Password) verification using the Twilio service. The class includes methods for OTP verification, checking the count of OTP resend, adding to the resend count, and deleting a resend record.

## Table of Contents

- [Requirements](#requirements)
- [Configuration](#configuration)
- [Class: OTP_Model](#class-otp_model)
  - [Method: \_\_init\_\_](#method-init)
  - [Method: verification](#method-verification)
  - [Method: verification_check](#method-verification_check)
  - [Method: check_count](#method-check_count)
  - [Method: add_count](#method-check_count)
  - [Method: delete_count](#method-delete_count)

## Requirements

- Python 3.x
- `twilio` library (version 6.x or higher)
- `settings` module
- `src.schemas.svretries` module
- `logging` module
- `werkzeug.exceptions` module
- `datetime` module

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

Ensure that the `settings` module contains the necessary configurations.

## Class: `OTP_Model`

The `OTP_Model` class provides methods for OTP verification using the Twilio service.

```python
class OTP_Model:
    """
    This class implements a model for One-Time Password (OTP) verification
    using the Twilio Verify API.
    """
```

### Method:  `__init__` <a name='method-init'></a>

```python
def __init__(self, phone_number: str) -> None:
```

The `OTP_Model` class is initialized with a `phone_number` parameter. The class constructor sets up the Twilio client using the provided account SID and authentication token.

***Arguments***:

- `phone_number (str)`: The phone number in context for the OTP verification process

***Returns***:

- `None`

### Method: `verification`

```python
def verification(self) -> SMSObject:
```

Sends the OTP verification code to the specified phone number.

***Returns***

- `verification (SMSObject)`: The verification object returned by the Twilio API.

***Raises***

- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

### Method: `verification_check`

```python
def verification_check(self, code: str) -> SMSObject:
```

Verifies the OTP code sent to the specified phone number.

***Arguments***:

- `code (str)`: The OTP code to be verified.

***Returns***

`verification_check (SMSObject)`: The verification check object returned by the Twilio API.

***Raises***

- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

- `Forbidden`:
  - When checking an OTP code using the Twilio Verify API, if the code is wrong, Twilio will raise a TwilioRestException indicating that the verification failed.
  - Twilio API returns a 403 Forbidden status code. This typically happens when there are issues with the request, such as invalid credentials or insufficient permissions to perform the requested operation. In this case, the Forbidden exception is raised to indicate that the verification check failed due to a forbidden error.

### Method: `check_count`

```python
def check_count(self, unique_id: str, user_id: str):
```

Checks the SMS resend record count for a specific user.

***Arguments***

- `unique_id (str)`: The unique identifier for the SMS resend record.
- `user_id (str)`: The user identifier.

***Returns***

- `counter (Svretries)`: The SMS resend record for the specified user.

***Raises***

- `TooManyRequests`: User has reached the maximum number of verification attempts within a certain timeframe, and may need to wait before attempting again.


### Method: `add_count`

```python
def add_count(self, counter) -> str:
```

Adds a count to the SMS resend record for the specified user.

***Arguments***

- `counter (Svretries)`: The SMS resend record object.

***Returns***

- `expires_timestamp (str)`: The timestamp when the count expires.

### Method: `delete_count`

```python
def delete_count(self, counter_id: int):
```

Deletes the SMS resend record with the specified ID.

***Arguments***:

- `counter_id (int)`: The ID of the SMS resend record to be deleted.

***Raises***

- `Forbidden`: Trying to delete an SMS resend record that does not exist.
