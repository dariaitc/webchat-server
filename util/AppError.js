
class AppError extends Error {
    message = undefined
    statusCode = undefined
    status = undefined
    isOperational = undefined
    constructor(message, statusCode) {
        super(message)
        this.message = message
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error'
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor);
    }
} 

module.exports = AppError