# Credentials Database Model

## Class: `Credentials`

**Base:**

- `Model`: The Peewee Model class

**Table:**

- `credentials`: The SQL table name

### Fields

- `shared_key (TextField)`: The shared key used in encryption and decryption operations

- `hashing_salt (TextField)`: The salt used when performing hashing operations

- `createdAt (DateTimeField)`: The time of creation, defaults to `datetime.now`

**Note:**

- This class provides methods for encrypting and decrypting cookies.

**Raises:**

- any error caught

**Example:**

```python
from src.schema.credentials import Credentials

creds = Credentials.get(Credentials.id == 1)
e_key = creds.shared_key
h_salt = creds.hashing_salt
```
