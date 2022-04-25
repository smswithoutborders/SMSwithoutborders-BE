class BadRequest(Exception):
    def __init__(self, message='bad request'):
        self.message = message
        super().__init__(self.message)

class Unauthorized(Exception):
    def __init__(self, message='unauthorized'):
        self.message = message
        super().__init__(self.message)

class Forbidden(Exception):
    def __init__(self, message='forbidden'):
        self.message = message
        super().__init__(self.message)

class Conflict(Exception):
    def __init__(self, message='conflict'):
        self.message = message
        super().__init__(self.message)

class InternalServerError(Exception):
    def __init__(self, message='internal server error'):
        self.message = message
        super().__init__(self.message)