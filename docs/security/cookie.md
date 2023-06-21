# Cookie Module

## Class: `Cookie`

This class provides methods for encrypting and decrypting cookies.

### Attributes

- `key_bytes (int)`: The number of bytes used for the encryption key.
- `key (bytes)`: The encryption key used for encrypting and decrypting cookies.

### Methods

### `__init__(self, key: str = None) -> None` [[view source](/src/security/cookie.py#L39-L62)]

Initializes the Cookie class.

**Parameters:**

- `key (str, optional)`: The encryption key used for encrypting and decrypting cookies.
If not provided, the shared key specified in the configuration file is used.

**Returns:**

- `None`

**Raises:**

- `InternalServerError`: If the encryption key length is invalid.

**Example:**

```python
from src.security.cookie import Cookie

cookie = Cookie()
```

### `encrypt(self, data: str) -> str` [[view source](/src/security/cookie.py#L64-L85)]

Encrypts the specified cookie data string using the encryption key.

**Parameters:**

- `data (str)`: The cookie data string

**Returns:**

- `str`: The encrypted cookie string

**Example:**

```python
from src.security.cookie import Cookie
from src.models.sessions import Session_Model
from src.models.users import User_Model
from src.security.data import Data
from flask import Flask, request, jsonify
from datetime import timedelta

app = Flask(__name__)

@app.route("/some/endpoint")
def handler():

    # some server logic

    Session = Session_Model()
    User = User_Model()
    cookie = Cookie()
    data = Data()

    user_agent = request.headers.get("User-Agent")

    phone_number = "+1234567890"
    phone_number_hash = data.hash(phone_number)

    user = User.find(phone_number=phone_number)

    res = jsonify({
        "uid":user["userId"]
    })

    session = Session.create(
        unique_identifier=phone_number_hash,
        user_agent=user_agent,
        type="verify"
    )

    cookie_data = json.dumps({
        "sid": session["sid"],
        "cookie": session["data"],
        "type": session["type"]
    })

    e_cookie = cookie.encrypt(cookie_data)

    session_data = json.loads(session["data"])

    res.set_cookie(
        "cookie_name",
        e_cookie,
        max_age=timedelta(milliseconds=session_data["maxAge"]),
        secure=session_data["secure"],
        httponly=session_data["httpOnly"],
        samesite=session_data["sameSite"]
    )

```

### `decrypt(self, data: str) -> str` [[view source](/src/security/cookie.py#L87-L114)]

Decrypts the encrypted cookie data string using the encryption key.

**Parameters:**

- `data (str)`: The encrypted cookie data string

**Returns:**

- `str`: The decrypted cookie string

**Raises:**

Unauthorized: If an error occurs during decryption, a key error.

**Example:**

```python
from src.security.cookie import Cookie
from src.models.sessions import Session_Model
from flask import Flask, request

app = Flask(__name__)

@app.route("/some/endpoint")
def handler():

    # some server logic

    Session = Session_Model()
    cookie = Cookie()

    e_cookie = request.cookies.get(cookie_name)
    d_cookie = cookie.decrypt(e_cookie)
    json_cookie = json.loads(d_cookie)

    # you can then extract relevant fields and use them like so:

    sid = json_cookie["sid"]
    uid = json_cookie["uid"]
    unique_identifier = json_cookie["unique_identifier"]
    user_cookie = json_cookie["cookie"]
    type = json_cookie["type"]
    status = json_cookie["status"]
    user_agent = request.headers.get("User-Agent")

    Session.find(
        sid=sid,
        unique_identifier=unique_identifier,
        user_agent=user_agent,
        cookie=user_cookie,
        type=type,
        status=status
    )

    # rest of the server logic

```

## See also

- [Cookie Class](../security/cookie.md)
- [Data Class](../security/data.md)
- [User Model](../models/users.md)
- [Session Model](../models/sessions.md)
