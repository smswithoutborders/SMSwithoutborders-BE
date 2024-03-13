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

counter = Svetries.create(
    uniqueId="phone_number_hash",
    userId="userId",
    count=0,
    expires=None
)
```
