# Retries Database Model

## Class: `Retries`

**Base:**

- `Model`: The Peewee Model class

**Table:**

- `retries`: The SQL table name

**Note:**

- This model provides methods to interact with the database, allowing for database operations to be performed on the `retries` table, with fields listed below (used for user credentials verification attempts tracking).

### Fields

- `uniqueId (CharField)`: The retry record unique identifier, basically the phone number hash

- `count (IntegerField)`: The short attempts count tracker

- `block (IntegerField)`: The long attempts count tracker

- `expires (DateTimeField)`: The maxAge of the retry record

- `createdAt (DateTimeField)`: The time of creation, defaults to `datetime.now`

**Example:**

```python
from src.schemas.retries import Retries

counter = Retries.get(Retries.uniqueId="phone_number_hash")
```
