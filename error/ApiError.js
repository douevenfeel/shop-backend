class ApiError extends Error {
    constructor(status, message, error) {
        super();
        this.status = status;
        this.message = message;
        this.error = error;
    }

    static badRequest(message, error) {
        return new ApiError(404, message, error);
    }

    static internal(message) {
        return new ApiError(500, message);
    }

    static forbidden(message) {
        return new ApiError(403, 'forbidden');
    }

    static unauthorizedError() {
        return new ApiError(401, 'not authorized');
    }
}

module.exports = ApiError;
