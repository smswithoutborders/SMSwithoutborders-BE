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
import json

cookie = Cookie()

cookie_data = json.dumps({
    "sid": "session_sid",
    "cookie": "session_data",
    "type": "session_type"
})

encrypted_cookie = cookie.encrypt(cookie_data)
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
import json

cookie = Cookie()

decrypted_cookie = cookie.decrypt("encrypted_cookie")
json_cookie = json.loads(decrypted_cookie)
```
