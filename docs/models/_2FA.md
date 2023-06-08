# _2FA Module

## `Class`: OTP_Model

This class implements a model for One-Time Password (OTP) verification using the Twilio Verify API.

## Attributes

- `client`: An instance of the Twilio Client class used for API communication.
- `phone_number`: The phone number to send OTPs to.
- `Svretries`: A reference to the Svretries database model.

## Methods

### `__init__(self, phone_number: str) -> None` [[view source](https://github.com/smswithoutborders/SMSwithoutborders-BE/blob/27ad8d4ed81ef73581515c2b2b17274d0fbaca72/src/models/_2FA.py#L34-L42)]

Initializes an OTP_Model instance.

**Parameters:**

- `phone_number` (str): The phone number to send OTPs to.

**Returns:**

- `None`

**Example:**

```python
model = OTP_Model("+1234567890")
```

**Notes:**

- The phone_number parameter should be a string representing the phone number to which OTPs will be sent.

### `verification(self) -> SMSObject` [[view source](https://github.com/smswithoutborders/SMSwithoutborders-BE/blob/27ad8d4ed81ef73581515c2b2b17274d0fbaca72/src/models/_2FA.py#L44-L65)]

Starts an OTP verification process using the Twilio Verify API.

**Returns:**

- `SMSObject`: The verification object returned by the Twilio API.

**Raises:**

- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

**Example:**

```python
otp = OTP_Model(phone_number='+237671234567')
otp_res = otp.verification()
```

### `verification_check(self, code: str) -> SMSObject` [[view source](https://github.com/smswithoutborders/SMSwithoutborders-BE/blob/27ad8d4ed81ef73581515c2b2b17274d0fbaca72/src/models/_2FA.py#L67-L96)]

Verifies the OTP code sent to the specified phone number.

**Parameters:**

- `code` (str): The OTP code to be verified.

**Returns:**

- `SMSObject`: The verification check object returned by the Twilio API.

**Raises:**

- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

- `Forbidden`: Invalid credentials or insufficient permissions to perform the requested operation

**Examples:**

```python
otp = OTP_Model(phone_number='+237671234567')
otp_res = otp.verification_check(code='123456')
```

**Notes:**

- When checking an OTP code using the Twilio Verify API, if the code is wrong, Twilio will raise a TwilioRestException indicating that the verification failed.
- Twilio API returns a 403 Forbidden status code. This typically happens when there are issues with the request, such as invalid credentials or insufficient permissions to perform the requested operation. In this case, the Forbidden exception is raised to indicate that the verification check failed due to a forbidden error.

### `check_count(self, unique_id: str, user_id: str)` [[view source](https://github.com/smswithoutborders/SMSwithoutborders-BE/blob/27ad8d4ed81ef73581515c2b2b17274d0fbaca72/src/models/_2FA.py#L98-L162)]

Checks for an Svretries instance for a specific user.

**Parameters:**

- `unique_id (str)`: The unique identifier for the SMS resend record.
- `user_id (str)`: The user identifier.

**Returns:**

An instance of the Svretries database model.

**Raises:**

- `TooManyRequests`: User has reached the maximum number of verification attempts within a certain timeframe, and may need to wait before attempting again.

**Examples:**

```python
otp = OTP_Model(phone_number='+237671234567')
if enable_otp_counter:
  otp_counter = otp.check_count(
      unique_id='phone_number_hash',
      user_id='user_id'
  )
```

### `add_count(self, counter) -> str` [[view source](https://github.com/smswithoutborders/SMSwithoutborders-BE/blob/27ad8d4ed81ef73581515c2b2b17274d0fbaca72/src/models/_2FA.py#L164-L247)]

Adds to the count of verification attempts and updates the expiry date for a user's OTP verification.

**Parameters:**

- `counter (Svretries)`: An instance of the Svretries database model.

**Returns:**

The timestamp for which the counter (instance) expires.

**Examples:**

```python
otp = OTP_Model(phone_number='+237671234567')
otp_res = otp.verification()

if otp_res.status == "pending":
  if enable_otp_counter:
    expires = otp.add_count(otp_counter)
```

### `delete_count(self, counter_id: int)` [[view source](https://github.com/smswithoutborders/SMSwithoutborders-BE/blob/27ad8d4ed81ef73581515c2b2b17274d0fbaca72/src/models/_2FA.py#L249-L275)]

 Deletes the instance of the Svretries database model with the specified `counter_id`.

**Parameters:**

- `counter_id (int)`: The ID of the Svretries database model instance to be deleted.

**Raises:**

- `Forbidden`: Trying to delete an Svretries model instance that does not exist.

**Examples:**

```python
otp = OTP_Model(phone_number='+237671234567')
otp_res = otp_check.verification()

if otp_res.status == "approved":
  if enable_otp_counter:
    otp_counter = otp.check_count(
      unique_id='phone_number_hash',
      user_id='user_id'
    )

    cid = otp_counter.id
    otp.delete_count(otp_counter=cid)
```

## See Also

<!-- - [Related Function](link_to_related_function) -->
- [Twilio Client](https://github.com/twilio/twilio-python#use-the-helper-library)
- [Svretries Model](link_to_Svretries_class)
