# Wallets Database Model

## Class: `Wallets`

**Base:**

- `Model`: The Peewee Model class

**Table:**

- `wallets`: The SQL table name

**Note:**

- This model provides methods to interact with the database, allowing for database operations to be performed on the `wallets` table, with fields listed below (used for user grants info tracking, that i, user's information from a third party platform).

### Fields

- `username (CharField)`: The user's profile name on the third party platform

- `token (TextField)`: The auth token from the third party platform

- `uniqueId (CharField)`: The user's unique profile id on the third party platform

- `uniqueIdHash (CharField)`: The user's unique ID hash

- `iv (CharField)`: The initialization vector used during cryptographic operations

- `userId (ForeignKeyField)`: The user's ID, in the `users` table

- `platformId (CharField)`: The third party platform identifier

- `createdAt (DateTimeField)`: The time of creation, defaults to `datetime.now`

**Example:**

```python
from src.schemas.wallets import Wallets

Wallets.create(
    userId="user_id",
    platformId="platform_id",
    username="encrypted_grant_profile_name",
    token="encrypted_grant_token",
    uniqueId="encrypted_grant_profile_unique_id",
    uniqueIdHash="grant_profile_unique_id_hash",
)
```
