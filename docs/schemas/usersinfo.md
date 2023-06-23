# UsersInfos Database Model

## Class: `UsersInfos`

**Base:**

- `Model`: The Peewee Model class

**Table:**

- `usersInfos`: The SQL table name

**Note:**

- This model provides methods to interact with the database, allowing for database operations to be performed on the `users` table, with fields listed below (used for detailed user info tracking).

### Fields

- `name (CharField)`: The user's name

- `country_code (CharField)`: The user's country_code

- `full_phone_number (CharField)`: The user's country_code+ phone_number

- `status (CharField)`: The user's verification status, defaults to `unverified`

- `userId (ForeignKeyField)`: The user's identifier, in the `users` table

- `iv (CharField)`: The initialization vector used for cryptographic operations

- `createdAt (DateTimeField)`: The time of creation, defaults to `datetime.now`

**Example:**

```python
from src.schemas.users import Users
from src.schemas.usersinfos import UsersInfos
from src.security.data import Data

data = Data()

password = "user_password"
password_hash = data.hash(data=password)
name = "User Name"
country_code = "+123"
phone_number = "123457890"
full_phone_number = country_code+phone_number
phone_number_hash = data.hash(data=full_phone_number)

new_user = Users.create(
    password=password_hash
)

UsersInfos.create(
    name=data.encrypt(data=name),
    country_code=data.encrypt(data=country_code),
    full_phone_number=phone_number_hash,
    userId=new_user.id,
)
```

## See Also

- [Data Class](../security/data.md)
- [Users Schema](../schemas/users.md)
