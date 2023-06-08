# _2FA Module

## OTP_Model

<!-- ```python
class OTP_Model:
``` -->

Provides functionality for OTP (One Time Password) verification using the Twilio service. The class includes methods for OTP verification, checking the count of OTP resend, adding to the resend count, and deleting a resend record.

### \_\_init\_\_

<!-- ```python
OTP_Model(phone_number: str)
``` -->

**Signature:** `OTP_Model(phone_number: str) -> None`

Sets up the Twilio client using the provided account SID and authentication token.

**Parameters:**

- `phone_number (str)`: The phone number in context for the OTP verification process.


**Examples:**

```python
# Example usage of the method
otp = OTP_Model(phone_number='+237671234567')
```

**Properties:**

### client

The Twilio REST Client helper library provided in the Twilio Python SDK.

**Type:** `twilio.rest.Client`

### phone_number

The phone number in context for the OTP verification process.

**Type:** `str`

### Svretries

The OTP resend record

**Type:** `schemas.svretries`


## verification

**Signature:** `verification() -> SMSObject`

Starts an OTP verification process using the Twilio Verify API.


**Returns:**

The verification object returned by the Twilio API.

**Raises:**

- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

**Examples:**

```python
# Example usage of the function
otp = OTP_Model(phone_number='+237671234567')
otp_res = otp.verification()
```

## verification_check

**Signature:** `verification_check(code: str) -> SMSObject`

Verifies the OTP code sent to the specified phone number.


**Returns:**

The verification check object returned by the Twilio API.

**Raises:**

- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

- `Forbidden`:
  - When checking an OTP code using the Twilio Verify API, if the code is wrong, Twilio will raise a TwilioRestException indicating that the verification failed.
  - Twilio API returns a 403 Forbidden status code. This typically happens when there are issues with the request, such as invalid credentials or insufficient permissions to perform the requested operation. In this case, the Forbidden exception is raised to indicate that the verification check failed due to a forbidden error.

**Examples:**

```python
# Example usage of the function
otp = OTP_Model(phone_number='+237671234567')
otp_res = otp.verification_check(code='123456')
```

## check_count

**Signature:** `check_count(unique_id: str, user_id: str)`

Checks the SMS resend record count for a specific user.

**Arguments:**

- `unique_id (str)`: The unique identifier for the SMS resend record.
- `user_id (str)`: The user identifier.

**Returns:**

The SMS resend record for the specified user.

**Raises:**

- `TooManyRequests`: User has reached the maximum number of verification attempts within a certain timeframe, and may need to wait before attempting again.

**Examples:**

```python
# Example usage of the function
otp = OTP_Model(phone_number='+237671234567')
if enable_otp_counter:
  otp_counter = otp.check_count(
      unique_id='phone_number_hash',
      user_id='user_id'
  )
```

## add_count

**Signature:** `add_count(counter) -> str`

Checks the SMS resend record count for a specific user.

**Arguments:**

- `counter (Svretries)`: The SMS resend record object.

**Returns:**

- `str`: The timestamp when the count expires.

**Examples:**

```python
# Example usage of the function
otp = OTP_Model(phone_number='+237671234567')
otp_res = otp.verification()

if otp_res.status == "pending":
  if enable_otp_counter:
    expires = otp.add_count(otp_counter)
```

## delete_count

**Signature:** `delete_count(counter_id: int)`

Checks the SMS resend record count for a specific user.

**Arguments:**

- `counter_id (int)`: The ID of the SMS resend record to be deleted.

**Raises:**

- `Forbidden`: Trying to delete an SMS resend record that does not exist.

**Examples:**

```python
# Example usage of the function
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

- [Related Function](link_to_related_function)
- [Twilio Client](https://github.com/twilio/twilio-python#use-the-helper-library)
- [Svretries Record](link_to_Svretries_class)
