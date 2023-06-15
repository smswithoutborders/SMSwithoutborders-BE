# Grants Module

The `Grant_Model` class the provides functionality for storing, decrypting, deleting, finding and purging grants.

A `grant` is an object that typically contains data from the third-party platform, which is unique to a user and the platform in context.
This can be data like the auth token and the profile data from a third party platform, say Twitter for example, preformatted in the SWOB Custom Third Party Platforms Project [which provides some layer of abstraction to the underlying protocol mechanisms].

## Table of Contents

- [Requirements](#requirements)
- [Class: Grant_Model]()
  - [Method: \_\_init\_\_]()
  - [Method: verification]()
  - [Method: verification_check]()
  - [Method: check_count]()
  - [Method: add_count]()
  - [Method: delete_count]()

## Requirements

- Python 3.x
- `peewee` library
- `settings` module
- `src.schemas.wallets` module
- `src.schemas.usersinfo` module
- `src.security.data` module
- `src.models.broadcast` module
- `src.protocolHandler` module
- `src.security.data` module
- `logging` module
- `json` module
- `werkzeug.exceptions` module
- `SwobThirdPartyPlatforms` package

The following libraries are imported in the code:

```python
import logging
import json

from peewee import DatabaseError

from src.schemas.wallets import Wallets
from src.schemas.usersinfo import UsersInfos

from src.protocolHandler import OAuth2, TwoFactor

from src.security.data import Data

from src.models.broadcast import publish

from SwobThirdPartyPlatforms import ImportPlatform
from SwobThirdPartyPlatforms.exceptions import PlatformDoesNotExist

from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import Conflict
from werkzeug.exceptions import InternalServerError
```

## Class: `Grant_Model`

```python
class Grant_Model:
```

The `Grant_Model` class the provides functionality for storing, decrypting, deleting, finding and purging grants.

### Method:  `__init__`

```python
def __init__(self) -> None:
```

The `Grant_Model` class is initialized without any parameter. The class constructor sets up the Twilio client using the provided account SID and authentication token.

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
