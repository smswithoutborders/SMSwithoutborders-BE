# Database Connector

This module provides an abstraction for creating and connecting the the database to be used throughout the data flow.

## Functions

### `create_database_if_not_exits(user: str, password: str, database: str, host: str) -> None` [[View Source](/src/schemas/db_connector.py#L12-L27)]

This function creates a database if it doesn't exist

**parameters:**

- `user (str)`: The MySQL user name
- `password (str)`: The MySQL user password
- `database (str)`: The MySQL database name
- `host (str)`: The MySQL server host

**Returns:**

- `None`

**Raises:**

- any error caught

**Note:**

- This module also provides a Database object, instantiated with all the necessary information needed to open a connection to a database, and then can be used to:

  - Open and close connections
  - Execute queries
  - Manage transactions (and savepoints)
  - Introspect tables, columns, indexes and constraints

- All the necessary information are from the Configurations class of the settings module

**Example:**

```python
from src.schemas.db_connector import db

# open db connection
db.connect()

# close db connection
db.close()
```
