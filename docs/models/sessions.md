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
from src.models.users import User_Model
from flask import Flask, request

app = Flask(__name__)

@app.route("/some/endpoint/create")
def handler():

  # some server logic

  Session = Session_Model()
  User = User_Model()

  user_id = User.create(
    phone_number="1234567890",
    name="John Doe",
    country_code="+123",
    password="user_password"
  )
  user_agent = request.headers.get("User-Agent")

  session = Session.create(
    unique_identifier=user_id,
    user_agent=user_agent,
    type="signup"
  )

  # rest of server logic
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
from src.models.users import User_Model
from src.security import Cookie
from flask import Flask, request

app = Flask(__name__)

@app.route("/some/endpoint/update")
def handler():

  # some server logic

  Session = Session_Model()
  User = User_Model()
  cookie = Cookie()

  e_cookie = request.cookies.get("cookie_name")
  d_cookie = cookie.decrypt(e_cookie)
  json_cookie = json.loads(d_cookie)

  sid = json_cookie["sid"]
  user_cookie = json_cookie["cookie"]

  user = User.find(phone_number="+1234567890")
  user_agent = request.headers.get("User-Agent")


  Session.find(
    sid=sid,
    unique_identifier=user["userId"],
    user_agent=user_agent,
    cookie=user_cookie
  )

  # rest of the server logic
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
from src.models.users import User_Model
from src.security import Cookie
from flask import Flask, request

app = Flask(__name__)

@app.route("/some/endpoint/find")
def handler():

  # some server logic

  Session = Session_Model()
  User = User_Model()
  cookie = Cookie()

  e_cookie = request.cookies.get("cookie_name")
  d_cookie = cookie.decrypt(e_cookie)
  json_cookie = json.loads(d_cookie)

  sid = json_cookie["sid"]

  user = User.find(phone_number="+1234567890")

  Session.find(
    sid=sid,
    unique_identifier=user["userId"],
  )

  # rest of the server logic
```

## See also

- [Cookie Class](../security/cookie.md)
- [User Model](../models/users.md)
