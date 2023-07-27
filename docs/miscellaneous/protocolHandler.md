# Protocol Handler Module

## `Class`: OAuth2

This class provides layers of abstractions as methods for handling user validation, authorization and invalidation with the OAuth2 protocol

## Attributes

`origin (str)`: The origin URL of the request.
`platform_name (str)`: The name of the platform for which the auth transactions are to take place.
`Platform`: A layer of abstraction of the platform object, provided by the SWOB Custom ThirdParty Platforms library.
`Methods`: The platform's methods object.

## Methods

### `__init__(self, origin: str, platform_name: str) -> None` [[view source](/src/protocolHandler.py#L26-L46)]

Initializes an OAuth2 instance.

**Parameters:**

- `origin (str)`: The origin of the request, used in forming the callback url for the auth transaction

- `platform_name (str)`: The name of the platform in context

**Returns:**

- `None`

**Raises:**

- `BadRequest`: If the platform_name is invalid

**Example:**

```python
from src.protocolHandler import OAuth2

Protocol = OAuth2(origin="originUrl", platform_name="platform_name")
```

### `authorization(self) -> dict` [[view source](/src/protocolHandler.py#L48-L60)]

Initiates an authorization transaction.

**Returns:**

- `dict`: A dictionary containing the authorization url and code verifier

**Example:**

```python
from src.protocolHandler import OAuth2

Protocol = OAuth2(origin="originUrl", platform_name="platform_name")

result = Protocol.authorization()
```

### `validation(self, code, scope=None, code_verifier=None) -> dict` [[view source](/src/protocolHandler.py#L62-L87)]

Initiates a validation transaction.

**Parameters:**

`code (str)`: The authorization code.
`scope (str, optional)`: The auth scope.
`code_verifier (str, optional)`: The code verifier from the authorization transaction.

**Returns:**

- `dict`: A dictionary containing the auth grant, typically consisting of a token and profile data.

**Raises:**

- `UnprocessableEntity()`: If there's a scope mismatch

**Example:**

```python
from src.protocolHandler import OAuth2

Protocol = OAuth2(origin="originUrl", platform_name="platform_name")

result = Protocol.validation(
    code="code",
    scope="scope",
    code_verifier="code_verifier"
)
```

### `invalidation(self, token: str) -> None` [[view source](/src/protocolHandler.py#L89-L102)]

Initiates an invalidation transaction.

**Parameters:**

`token (str)`: The token obtained from the authorization transaction.

**Returns:**

- `None`

**Example:**

```python
from src.protocolHandler import OAuth2

Protocol = OAuth2(origin="originUrl", platform_name="platform_name")

Protocol.invalidation(token="grant_token")
```

## `Class`: TwoFactor

This class provides layers of abstractions as methods for handling user validation, authorization and invalidation with the TwoFactor protocol

## Attributes

`identifier (str)`: Identifier for the user, typically the phone number.
`platform_name (str)`: The name of the platform for which the auth transactions are to take place.
`Platform`: A layer of abstraction of the platform object, provided by the SWOB Custom ThirdParty Platforms library.
`Methods`: The platform's methods object.

## Methods

### `__init__(self, identifier: str, platform_name: str) -> None` [[view source](/src/protocolHandler.py#L116-L133)]

Initializes a TwoFactor protocol instance.

**Parameters:**

- `identifier (str)`: Identifier for the user (phone number in int'l format)

- `platform_name (str)`: The name of the platform in context

**Returns:**

- `None`

**Raises:**

- `BadRequest`: If the platform_name is invalid

**Example:**

```python
from src.protocolHandler import TwoFactor

Protocol = TwoFactor(identifier="phone_number", platform_name="platform_name")
```

### `authorization(self) -> dict` [[view source](/src/protocolHandler.py#L135-L153)]

Initiates an authorization transaction.

**Returns:**

- `dict`: A dictionary containing a `body` key with value as a `200` response code, or `201` if a session exists

**Raises:**

- `TooManyRequest()`: If there are too many authorization requests

**Example:**

```python
from src.protocolHandler import TwoFactor

Protocol = TwoFactor(identifier="phone_number", platform_name="platform_name")

result= Protocol.authorization()
```

### `validation(self, code: str, **kwargs) -> dict` [[view source](/src/protocolHandler.py#L155-L180)]

Initiates a validation transaction.

**Parameters:**

`code (str)`: The authorization code.

**Returns:**

- `dict`:

  - A dictionary containing the auth grant, if session password is not needed. Or:

  - A dictionary with `initialization_url` and `body` key with value as a `202` response code if session password is needed

**Raises:**

- `TooManyRequest()`: If there's a flood wait error

- `Forbidden()`: If there's an invalid phone code

**Example:**

```python
from src.protocolHandler import TwoFactor

Protocol = TwoFactor(identifier="phone_number", platform_name="platform_name")

result = Protocol.validation(
    code="code",
    scope="scope",
    code_verifier="code_verifier"
)
```

### `password_validation(self, password: str) -> dict` [[view source](/src/protocolHandler.py#L182-L195)]

Initiates a password validation transaction.

**Parameters:**

`password (str)`: The password for validation.

**Returns:**

- `dict`: A dictionary containing the auth grant.

**Raises:**

- `TooManyRequest()`: If there's a flood wait error

- `Forbidden()`: If there's an invalid password hash provided

**Example:**

```python
from src.protocolHandler import TwoFactor

Protocol = TwoFactor(identifier="phone_number", platform_name="platform_name")

result = Protocol.password_validation(
    password="user_password"
)
```

### `invalidation(self, token: str) -> None` [[view source](/src/protocolHandler.py#L199-L220)]

Initiates an invalidation transaction.

**Parameters:**

`token (str)`: The token obtained from the validation or password_validation transaction.

**Returns:**

- `None`

**Example:**

```python
from src.protocolHandler import TwoFactor

Protocol = TwoFactor(identifier="phone_number", platform_name="platform_name")

Protocol.invalidation(token="grant_token")

```
