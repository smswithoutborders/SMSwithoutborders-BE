# Users Module

## Class: `User_Model`

This class provides a layer of abstraction that encompasses attributes and methods peculiar to a user of the SWOB platform, which also aids in interacting with the user data and transactions carried out throughout the flow.

### Attributes

- `db`: The database connector
- `Users`: A reference to the Users database model
- `UsersInfo`: A reference to the UsersInfo database model
- `Retries`: A reference to the Retries database model
- `Data`: A reference to the Data security utility class
- `Wallets`: A reference to the Wallets database model

### Methods

### `__init__(self) -> None` [[view source](/src/models/users.py#L44-L56)]

Initializes the User_Model class.

**Returns:**

- `None`

**Example:**

```python
from src.models.users import User_Model

User = User_Model()
```

### `create(self, phone_number: str, country_code: str, name: str, password: str) -> str` [[view source](/src/models/users.py#L58-L141)]

Creates a new user.

**Parameters:**

- `phone_number (str)`: The user's phone number
- `country_code (str)`: The user's country code
- `name (str)`: The user's name
- `password (str)`: The user's password

**Returns:**

- `str`: The ID of the newly created user.

**Raises:**

- `Conflict`: If a user with the provided phone number already exists.
- `InternalServerError`: If there was an error creating the user, such as a database error.

**Example:**

```python
from src.models.users import User_Model

User = User_Model()
user_id = User.create(
  phone_number="phone_number",
  name="user_name",
  country_code="country_code",
  password="user_password"
)
```

### `verify(self, password: str, phone_number: str = None, user_id: str = None) -> dict` [[view source](/src/models/users.py#L143-L307)]

Verify a user's credentials.

**Parameters:**

- `password (str)`: The user's password
- `phone_number (str, optional)`: The user's phone number
- `user_id (str, optional)`: The user's identifier

**Returns:**

- `dict`: A dictionary representation of the user's details.

**Raises:**

- `Unauthorized`: If the user's phone number, ID or password is invalid.
- `Conflict`: If there are multiple verified accounts with the same phone number.
- `InternalServerError`: If there was an error verifying the user's credentials, such as a database error.

**Note:**

- This method verifies a user's credentials by checking the provided phone number (if provided) or user ID (if provided) against the hashed phone numbers of verified users in the database. If a verified user with a matching phone number or user ID is found, the provided password is checked against the hashed password of the user in the database. If the password matches, a dictionary containing the user's information is returned. If the phone number or user ID is invalid, or if there are multiple verified accounts with the same phone number, an error will be raised.

**Example:**

```python
from src.models.users import User_Model

User = User_Model()
verified_user = User.verify(user_id="user_id", password="user_password")
```

### `find(self, phone_number: str = None, user_id: str = None) -> UserObject` [[view source](/src/models/users.py#L309-L412)]

Verify a user's credentials.

**Parameters:**

- `phone_number (str, optional)`: The user's phone number in int'l format
- `user_id (str, optional)`: The user's identifier

**Returns:**

- `UserObject`: A dictionary representation of user's details as per the UsersInfo database model

**Raises:**

- `Unauthorized`: If user's given phone number or ID is invalid.
- `Conflict`: If there are multiple verified accounts with the same phone number.
- `InternalServerError`: If there was an error finding the user, such as a database error.

**Example:**

```python
from src.models.users import User_Model

User = User_Model()
user = User.find(phone_number="phone_number")
```

### `find_platform(self, user_id: str) -> UserPlatformObject` [[view source](/src/models/users.py#L414-L486)]

Fetches the saved and unsaved platforms for a user.

**Parameters:**

- `user_id (str, optional)`: The user's identifier

**Returns:**

- `UserPlatformObject`: A dictionary containing the saved and unsaved platforms for the user

**Raises:**

- `InternalServerError`: If there was an error fetching the platforms, such as a database error.

**Example:**

```python
from src.models.users import User_Model

User = User_Model()
user_platforms = User.find_platform(user_id="user_id")
```

### `update(self, user_id: str, status: str = None, password: str = None) -> None` [[view source](/src/models/users.py#L488-L570)]

Updates the given user's information in the database.

**Parameters:**

- `user_id (str)`: The user's identifier
- `status (str, optional)`: The new status to set for the user
- `password (str, optional)`: TThe new password to set for the user

**Returns:**

- `None`

**Raises:**

- `Unauthorized`: If the user with the given ID is not found.
- `Conflict`: If multiple users are found with the given ID.
- `InternalServerError`: If an error occurs while updating the user, such as a database error.

**Example:**

```python
from src.models.users import User_Model

User = User_Model()
User.update(user_id="user_id", status="user_status")
```

### `delete(self, user_id: str) -> None` [[view source](/src/models/users.py#L572-L623)]

Deletes the user account and associated user information from the database.

**Parameters:**

- `user_id (str)`: The user's identifier

**Returns:**

- `None`

**Raises:**

- `Unauthorized`: If the user with the given ID is not found.
- `Conflict`: If multiple users are found with the given ID.
- `InternalServerError`: If an error occurs while deleting the user, such as a database error.

**Example:**

```python
from src.models.users import User_Model

User = User_Model()
User.delete(user_id="user_id")
```

### `recaptcha(self, captchaToken: str, remoteIp: str) -> bool` [[view source](/src/models/users.py#L625-L665)]

Verifies the reCAPTCHA token with the Google reCAPTCHA service.

**Parameters:**

- `captchaToken (str)`: The reCAPTCHA token to verify.
- `remoteIp (str)`: The IP address of the user who submitted the reCAPTCHA.

**Returns:**

- `bool`: True if the token is valid, False otherwise.

**Raises:**

- `BadRequest`: If the reCAPTCHA token is invalid.
- `InternalServerError`: If an error occurs while verifying the reCAPTCHA.

**Example:**

```python
from src.models.users import User_Model

User = User_Model()
User.recaptcha(captchaToken="captcha_token", remoteIp="remote_ip")
```
