# Users Database Model

## Class: `Users`

**Base:**

- `Model`: The Peewee Model class

**Table:**

- `users`: The SQL table name

**Note:**

- This model provides methods to interact with the database, allowing for database operations to be performed on the `users` table, with fields listed below (used for minimal user info tracking).

### Fields

- `id (CharField)`: The user's identifier, defaults to a uuid1 string

- `password (CharField)`: The user's password

- `current_login (DateTimeField)`: The current login time

- `last_login (DateTimeField)`: The last login time

- `createdAt (DateTimeField)`: The time of creation, defaults to `datetime.now`

**Example:**

```python
from src.schemas.users import Users
from src.security.data import Data

data = Data()

password = "user_password"
password_hash = data.hash(data=password)

new_user = Users.create(
    password=password_hash
)
```

## See Also

- [Data Class](../security/data.md)
