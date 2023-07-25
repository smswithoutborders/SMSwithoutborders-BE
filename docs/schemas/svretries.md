# Svretries Database Model

## Class: `Svretries`

**Base:**

- `Model`: The Peewee Model class

**Table:**

- `svretries`: The SQL table name

**Note:**

- This model provides methods to interact with the database, allowing for database operations to be performed on the `svretries` table, with fields listed below (used for OTP verification attempts tracking).

### Fields

- `userId (CharField)`: The user identifier

- `uniqueId (CharField)`: The retry record unique identifier, basically the phone number hash

- `count (IntegerField)`: The short attempts count tracker

- `expires (DateTimeField)`: The maxAge of the retry record

- `createdAt (DateTimeField)`: The time of creation, defaults to `datetime.now`

**Example:**

```python
from src.schemas.svretries import Svretries
from src.security.data import Data
from src.models.users import User_Model

data = Data()
User= User_Model()

phone_number = "+1234567890"
phone_number_hash = data.hash(data=phone_number)
user = User.find(phone_number=phone_number)

counter = Svetries.create(
    uniqueId=phone_number_hash,
    userId=user["userId"],
    count=0,
    expires=None
)
```

## See Also

- [Data Class](../security/data.md)
- [User Model](../models/users.md)
