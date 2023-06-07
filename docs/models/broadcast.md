# Broadcast Module Documentation

The Broadcast module has a `publish` function which can broadcasts a message to a list of URLs defined in a whitelist file.

## Table Of Contents

- [Requirements](#requirements)
- [Configuration](#configuration)
- [Function: publish]()

## Requirements

- Python 3.x
- `settings` module
- `logging` module
- `urllib.parse` module
- `requests` module

The following libraries are imported in the code:

```python

from urllib.parse import urlparse
from settings import Configurations
import requests
import logging
```

## Configuration

Before using the `publish` function, a configuration needs to be set. This configuration is imported from a settings module. The required configuration is:

- `BROADCAST_WHITELIST`: The [path to a] file that contains the list URLs to be broadcasted to.

## Function: `publish`

```python
def publish(body: dict) -> None:
```

Parses every URL in the list of URLs defined in the whitelist file and broadcasts the message to it.

***Arguments***

- `body (dict)`: A dictionary or json object which serves as the body, [typically the message] of the broadcasting request.
