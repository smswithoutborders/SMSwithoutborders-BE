# Password Policy Module

The password_policy module has a `check_password` function which checks if a password complies with a password policy for enhanced security.

## Functions

### `check_password_policy(password) -> bool` [[view source](/src/security/password_policy.py#L12-L69)]

Checks if a password complies with a password policy that includes the following rules:

- `Length`: Passwords should be at least 8 characters long.
- `Complexity`: Passwords should include a combination of uppercase and lowercase letters, numbers, and relevant special characters.
- `Frequency`: Passwords should not have been previously compromised in a data breach.

**Parameters:**

- `password (str)`: The password to check.

**Returns:**

- `bool`: True if the password complies with the password policy, False otherwise.

**Example:**

```python
from src.security.password_policy import check_password_policy

check_password_policy(password="user_password")
```

**Note:**

- The password is checked for possible data breach involvement at [https://api.pwnedpasswords.com](https://api.pwnedpasswords.com)
