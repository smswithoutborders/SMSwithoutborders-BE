# Sessions Database Model

## Class: `Sessions`

**Base:**

- `Model`: The Peewee Model class

**Table:**

- `sessions`: The SQL table name

**Note:**

- This model provides methods to interact with the database, allowing for database operations to be performed on the `session` table, with fields listed below (used for session management).

### Fields

- `sid (CharField)`: The session identifier, defaults to a uuid4 string

- `unique_identifier (CharField)`: The unique identifier for a session

- `user_agent (CharField)`: The user agent string from User-Agent request header

- `expires (DateTimeField)`: The session maxAge

- `data (TextField)`: The session data

- `status (CharField)`: The session status

- `type (CharField)`: The session type

- `createdAt (DateTimeField)`: The time of creation, defaults to `datetime.now`

**Example:**

```python
from src.schemas.sessions import Sessions
from datetime import datetime, timedelta
import json

def create_session(unique_identifier: str, user_agent: str, cookie_data: dict, session_maxage: int, status: str = None, type: str = None) -> dict:

    expires = datetime.now() + timedelta(milliseconds=session_maxage)

    session = Sessions.create(
        unique_identifier=unique_identifier,
        user_agent=user_agent,
        expires=expires,
        data=json.dumps(cookie_data),
        status=status,
        type=type
    )

    return {
        "sid": str(session.sid),
        "uid": session.unique_identifier,
        "data": session.data,
        "type": session.type
    }
```
