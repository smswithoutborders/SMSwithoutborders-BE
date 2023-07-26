# Sessions Module

## Class: `Session_Model`

This class provides a layer of abstraction that encompasses attributes and methods related to secure session management

### Attributes

- `Sessions`: A reference to the Sessions database model
- `cookie_data`: A dictionary containing cookie data, used to create a cookie

### Methods

### `__init__(self) -> None` [[view source](/src/models/sessions.py#L20-L35)]

Initializes the Session_Model class.

**Returns:**

- `None`

**Example:**

```python
from src.models.sessions import Session_Model

Session = Session_Model()
```

### `create(self, unique_identifier: str, user_agent: str, status: str = None, type: str = None) -> dict` [[view source](/src/models/sessions.py#L37-L81)]

Creates a new session.

**Parameters:**

- `unique_identifier (str)`: User's ID, usually a hash of the user's phone number in international format
- `user_agent (str)`: A characteristic request header that lets the server application, operating system, vendor, and/or version of the requesting user agent.
- `status (str, optional)`:
- `type (str, optional)`: The session type, usually in context with the ongoing operation, for example signup, recovery

**Returns:**

- `dict`: A dictionary containing the session identifier, unique identifier, session data and session type

**Raises:**

- `InternalServerError`: If there was an error creating the session, a database error.

**Example:**

```python
from src.models.sessions import Session_Model

Session = Session_Model()
created_session = Session.create(unique_identifier="unique_identifier", user_agent="user_agent", type="session_type")
```

### `find(self, sid: str, unique_identifier: str, user_agent: str, cookie: str, status: str = None, type: str = None) -> str` [[view source](/src/models/sessions.py#L37-L81)]

Checks for a session.

**Parameters:**

- `sid (str)`: The session identifier
- `unique_identifier (str)`: User's UID
- `user_agent (str)`: A characteristic request header that lets the server application, operating system, vendor, and/or version of the requesting user agent.
- `cookie (str)`: The user's cookie
- `status (str, optional)`: Session status
- `type (str, optional)`: The session type, usually in context with the ongoing operation, for example signup, recovery

**Returns:**

- `str`: The unique identifier associated with the session

**Raises:**

- `InternalServerError`: If there was an error finding a session, a database error.
- `Conflict`: If multiple sessions were found.
- `Unauthorized`: If no sessions were found or if the session was invalid.

**Example:**

```python
from src.models.sessions import Session_Model

Session = Session_Model()
session_found = Session.find(
    sid="session_id",
    unique_identifier="unique_identifier",
    user_agent="user_agent",
    cookie="user_cookie"
)
```

### `update(self, sid: str, unique_identifier: str, status: str = None, type: str = None) -> dict` [[view source](/src/models/sessions.py#L37-L81)]

Updates a session.

**Parameters:**

- `sid (str)`: The session identifier
- `unique_identifier (str)`: User's UID
- `status (str, optional)`: Session status
- `type (str, optional)`: The session type, usually in context with the ongoing operation, for example signup, recovery

**Returns:**

- `str`: The unique identifier associated with the session

**Raises:**

- `Unauthorized`: If there was an error updating the session, a database error.

**Example:**

```python
from src.models.sessions import Session_Model

Session = Session_Model()
session_found = Session.update(
    sid="session_id",
    unique_identifier="unique_identifier",
    status="session_status",
    type="session_type"
)
```
