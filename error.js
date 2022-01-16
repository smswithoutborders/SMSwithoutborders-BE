'use strict';

class ErrorHandler extends Error {
    constructor(message) {
        if (new.target === ErrorHandler)
            throw new TypeError('Abstract class "ErrorHandler" cannot be instantiated directly.');
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        Error.captureStackTrace(this, this.contructor);
    }
}

// 400 Bad Request
class BadRequest extends ErrorHandler {
    constructor(m) {
        if (arguments.length === 0)
            super('bad request');
        else
            super(m);
    }
}

// 401 Unauthorized
class Unauthorized extends ErrorHandler {
    constructor(m) {
        if (arguments.length === 0)
            super('unauthorized');
        else
            super(m);
    }
}

// 403 Forbidden
class Forbidden extends ErrorHandler {
    constructor(m) {
        if (arguments.length === 0)
            super('forbidden');
        else
            super(m);
    }
}

// 404 Not Found
class NotFound extends ErrorHandler {
    constructor(m) {
        if (arguments.length === 0)
            super('not found');
        else
            super(m);
    }
}

// 409 Conflict
class Conflict extends ErrorHandler {
    constructor(m) {
        if (arguments.length === 0)
            super('conflict');
        else
            super(m);
    }
}

// 422 Unprocessable Entity
class UnprocessableEntity extends ErrorHandler {
    constructor(m) {
        if (arguments.length === 0)
            super('unprocessable entity');
        else
            super(m);
    }
}

// 500 Internal Server Error
class InternalServerError extends ErrorHandler {
    constructor(m) {
        if (arguments.length === 0)
            super('internal server error');
        else
            super(m);
    }
}

module.exports.BadRequest = BadRequest;
module.exports.Unauthorized = Unauthorized;
module.exports.Forbidden = Forbidden;
module.exports.NotFound = NotFound;
module.exports.Conflict = Conflict;
module.exports.UnprocessableEntity = UnprocessableEntity;
module.exports.InternalServerError = InternalServerError;