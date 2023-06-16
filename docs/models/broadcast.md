# Broadcast Module

The Broadcast module has a `publish` function which can broadcast a message to a list of URLs defined in a whitelist file.

## Functions

### `publish(body: dict) -> None` [[view source](/src/models/broadcast.py#L19-L44)]

Parses every URL in the list of URLs defined in the whitelist file and broadcasts the message to it.

**Parameters:**

- `body (dict)`: A dictionary which serves as the body, [typically contains the message] of the broadcast request.

**Returns:**

- `None`

**Example:**

```python
body = {
  message: "Some message to broadcast"
}

publish(body)
```
