# Credentials Database Model

## Class: `Credentials`

**Base:**

- `Model`: The Peewee Model class

**Table:**

- `credentials`: The SQL table name

**Note:**

- This model provides methods to interact with the database, allowing for database operations to be performed on the `credentials` table, with fields listed below.

### Fields

- `shared_key (TextField)`: The shared key used in encryption and decryption operations

- `hashing_salt (TextField)`: The salt used when performing hashing operations

- `createdAt (DateTimeField)`: The time of creation, defaults to `datetime.now`

**Raises:**

- any database error caught

**Example:**

```python
from src.schemas.credentials import Credentials

creds = Credentials.get(Credentials.id == 1)
e_key = creds.shared_key
h_salt = creds.hashing_salt
```
