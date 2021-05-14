class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    };
};

const handleError = (err, res) => {
    const {
        statusCode,
        message
    } = err;

    if (statusCode == 500) {
        console.error(message);

        return res.status(statusCode).json({
            status: "error",
            statusCode,
            message: "Something went wrong, check and try again"
        });
    }

    res.status(statusCode).json({
        status: "error",
        statusCode,
        message
    });
};

module.exports = {
    ErrorHandler,
    handleError
}