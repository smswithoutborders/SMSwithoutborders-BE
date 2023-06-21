# Data Module

## Class: `Data`

This class provides methods to encrypt, decrypt and hash data.

### Attributes

- `key_bytes (int)`: Length of the encryption key in bytes.

- `key (bytes)`: The key used for encrypting and decrypting data.

- `salt (bytes)`: Hashing salt used for hashing data.

### Methods

### `__init__(self, key: str = None) -> None` [[view source](/src/security/data.py#L40-L60)]

Initializes the Data class.

**Parameters:**

- `key (str, optional)`: The encryption key used for encrypting and decrypting cookies.
If not provided, the shared key specified in the configuration file is used.

**Returns:**

- `None`

**Raises:**

- `InternalServerError`: If the encryption key length is invalid.

**Example:**

```python
from src.security.data import Data

data = Data()
```

### `encrypt(self, data: str) -> str` [[view source](/src/security/data.py#L62-L91)]

Encrypts the given data string using AES-256-CBC encryption algorithm.

**Parameters:**

- `data (str)`: The data string to be encrypted.

**Returns:**

- `str`: A concatenation of the initialization vector and the cipher text.
- `None`: If there's no data to encrypt

**Example:**

```python
from src.security.data import Data

data = Data()

# you can use this for any data you want to encrypt
data = "data I want to encrypt"
e_data = data.encrypt(data)
```

### `decrypt(self, data: str) -> str` [[view source](/src/security/data.py#L93-L129)]

Decrypts the given data string using AES-256-CBC encryption algorithm.

**Parameters:**

- `data (str)`: The data string to be decrypted.

**Returns:**

- `str`: The plain (decrypted) data string.
- `None`: If there's no data to decrypt

**Example:**

```python
from src.security.data import Data

data = Data()

# you can use this for any data you want to encrypt
data = "data I want to encrypt"
e_data = data.encrypt(data)

# you can use this for any data you want to decrypt
d_data = data.decrypt(e_data)

# d_data will be equivalent to the original data string
```

### `hash(self, data: str, salt: str = None) -> str` [[view source](/src/security/data.py#L93-L129)]

Hashes the given data using HMAC-SHA512 hashing algorithm.

**Parameters:**

- data (str): The data to be hashed.
- salt (str, optional): The salt to be used in hashing the data. If not provided, the salt from the object's attributes will be used.

**Returns:**

- `str`: The hashed data string.

**Example:**

```python
from src.security.data import Data

data = Data()

# you can use this for any data you want to hash
data = "data I want to hash"
h_data = data.hash(data)
```
