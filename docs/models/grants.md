# Grants Module

## Class: `Grant_Model`

This class provides functionality for storing, decrypting, deleting, finding and purging grants.

### Attributes

- `Wallets`: A reference to the Wallets database model.
- `UsersInfos`: A reference to the UsersInfo database model.
- `Data`: A reference to the Data security utility class.

### Methods

### `__init__(self) -> None` [[view source](/src/models/grants.py#L37-L43)]

Initializes an Grant_Model instance.

**Returns:**

- `None`

**Example:**

```python
from src.models.grants import Grant_Model

Grant = Grant_Model()
```

**Notes:**

A `grant` is an object that typically contains data from the third-party platform, which is unique to a user and the platform in context.
This can be data like the auth token and the profile data from a third party platform, say Twitter for example, preformatted in the SWOB Custom Third Party Platforms Project [which provides some layer of abstraction to the underlying protocol mechanisms].

### `store(self, user_id: str, platform_id: str, grant: dict) -> None` [[view source](/src/models/grants.py#L45-L89)]

Stores the grant for a user and a platform to the database.

**Parameters:**

- `user_id (str)`: The user's identifier.
- `platform_id (str)`: The identifier for the selected platform.
- `grant (dict)`: An object containing user information pertaining to the selected platform.

**Returns:**

- `None`

**Raises:**

- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.
- `Conflict`: The user already has a grant stored for the selected platform.

**Example:**

```python
from src.models.grants import Grant_Model

Grant = Grant_Model()
Grant.store(user_id="user_id", platform_id="platform_id", grant=grant_dict)
```

### `decrypt(self, grant, refresh: bool = False) -> dict` [[view source](/src/models/grants.py#91-118)]

Decrypts a grant information

**Parameters:**

- `grant`: An object containing user information pertaining to the selected platform.
- `refresh (bool, optional)`

**Returns:**

- `dict`: The decrypted grant information

**Example:**

```python
from src.models.grants import Grant_Model

Grant = Grant_Model()
decrypted_grant = Grant.decrypt(grant=grant_dict)
```

### `delete(self, grant) -> None` [[view source](/src/models/grants.py#120-149)]

Deletes a grant information

**Parameters:**

- `grant`: An object containing user information pertaining to the selected platform.

**Returns:**

- `None`

**Raises:**

- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

**Example:**

```python
from src.models.grants import Grant_Model

Grant = Grant_Model()
Grant.delete(grant=grant_dict)
```

### `find(self, user_id: str, platform_id: str) -> GrantObject` [[view source](/src/models/grants.py#151-184)]

Finds a grant information in the database for a given user and platform.

**Parameters:**

- `user_id (str)`: The user's identifier for the selected platform.
- `platform_id (str)`: The identifier for the selected platform.

**Returns:**

- `GrantObject`: The found grant object.

**Raises:**

- `BadRequest`: The grant for the specified user_id and platform_id doesn't exist.
- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

**Example:**

```python
from src.models.grants import Grant_Model

Grant = Grant_Model()
grant_object = Grant.find(user_id="userId", platform_id="platform_id")
```

### `find_all(self, user_id: str) -> GrantObject` [[view source](/src/models/grants.py#186-216)]

Finds grant information of all platforms for a given user.

**Parameters:**

- `user_id (str)`: The user's identifier for the selected platform.

**Returns:**

- `GrantObject`: The found grant objects.

**Raises:**

- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

**Example:**

```python
from src.models.grants import Grant_Model

Grant = Grant_Model()
wallet = Grant.find_all(user_id="userId")
```

### `purge(self, originUrl: str, identifier: str, platform_name: str, token: str) -> None` [[view source](/src/models/grants.py#218-247)]

Invalidates a user's grant for a given platform.

**Parameters:**

- `originUrl`: The Origin URL used in forming Callback URL for the auth transaction. Can be gotten from the Origin Header of a request.
- `identifier`: The user's phone number
- `platform_name`: The selected platform name
- `token`: The auth token issued from the platform

**Returns:**

- `None`

**Raises:**

- `BadRequest`: The grant for the specified user_id and platform_id doesn't exist.
- `InternalServerError`: An unexpected error occurred with the underlying infrastructure of the server. More likely an issue/bug or glitch with the server's programming.

**Example:**

```python
from src.models.grants import Grant_Model

Grant = Grant_Model()
Grant.purge(originUrl="origin_url", identifier="identifier", platform_name="platform_name", token=token_object)
```
