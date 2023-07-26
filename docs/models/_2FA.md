# _2FA Module

## `Class`: OTP_Model

This class implements a model for One-Time Password (OTP) verification using the Twilio Verify API.

## Attributes

- `client`: An instance of the Twilio Client class used for API communication.
- `phone_number`: The phone number to send OTPs to.
- `Svretries`: A reference to the Svretries database model.

## Methods

### `__init__(self, phone_number: str) -> None` [[view source](/src/models/_2FA.py#L34-L42)]

Initializes an OTP_Model instance.

**Parameters:**

- `phone_number (str)`: The phone number to send OTPs to (in international format).

**Returns:**

- `None`

**Example:**

```python
from src.models._2FA import OTP_Model

otp = OTP_Model(phone_number="phone_number")
```

**Notes:**

- The phone_number parameter should be a string representing the phone number to which OTPs will be sent.

### `verification(self) -> SMSObject` [[view source](/src/models/_2FA.py#L44-L65)]

Starts an OTP verification process using the Twilio Verify API.

**Returns:**

- `SMSObject`: The verification object returned by the Twilio API.

**Raises:**

- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

**Example:**

```python
from src.models._2FA import OTP_Model

otp = OTP_Model(phone_number="phone_number")
otp_res = otp.verification()
```

### `verification_check(self, code: str) -> SMSObject` [[view source](/src/models/_2FA.py#L67-L96)]

Verifies the OTP code sent to the specified phone number.

**Parameters:**

- `code (str)`: The OTP code to be verified.

**Returns:**

- `SMSObject`: The verification check object returned by the Twilio API.

**Raises:**

- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

- `Forbidden`: Invalid credentials or insufficient permissions to perform the requested operation

**Examples:**

```python
from src.models._2FA import OTP_Model

otp = OTP_Model(phone_number="phone_number")
otp_res = otp.verification_check(code="code")
```

**Notes:**

- When checking an OTP code using the Twilio Verify API, if the code is wrong, Twilio will raise a TwilioRestException indicating that the verification failed.
- Twilio API returns a 403 Forbidden status code. This typically happens when there are issues with the request, such as invalid credentials or insufficient permissions to perform the requested operation. In this case, the Forbidden exception is raised to indicate that the verification check failed due to a forbidden error.

### `check_count(self, unique_id: str, user_id: str)` [[view source](/src/models/_2FA.py#L98-L162)]

Checks for an existing OTP counter (an instance of the Svretries model class which represents a record in the Svretries database table) for a specific user.

**Parameters:**

- `unique_id (str)`: The unique identifier for the counter.
- `user_id (str)`: The user identifier.

**Returns:**

An instance of the Svretries database model.

**Raises:**

- `TooManyRequests`: User has reached the maximum number of verification attempts within a certain timeframe, and may need to wait before attempting again.

**Examples:**

```python
from src.models._2FA import OTP_Model

otp = OTP_Model(phone_number="phone_number")
otp_counter = otp.check_count(
      unique_id="unique_id",
      user_id="userId"
    )
```

### `add_count(self, counter) -> str` [[view source](/src/models/_2FA.py#L164-L247)]

Adds to the count of verification attempts and updates the expiry date for a user's OTP verification.

**Parameters:**

- `counter (Svretries)`: An instance of the Svretries database model.

**Returns:**

The timestamp for which the counter (instance) expires.

**Examples:**

```python
from src.models._2FA import OTP_Model

otp = OTP_Model(phone_number="phone_number")
expires = otp.add_count(counter=otp_counter)
```

### `delete_count(self, counter_id: int)` [[view source](/src/models/_2FA.py#L249-L275)]

 Deletes the instance of the Svretries database model with the specified `counter_id`.

**Parameters:**

- `counter_id (int)`: The ID of the Svretries database model instance to be deleted.

**Raises:**

- `Forbidden`: Trying to delete an Svretries model instance that does not exist.

**Examples:**

```python
from src.models._2FA import OTP_Model

otp = OTP_Model(phone_number="phone_number")
otp.delete_count(counter_id=otp_counter_id)
```

