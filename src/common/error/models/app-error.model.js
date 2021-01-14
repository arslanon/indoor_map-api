class AppErrorModel extends Error {
    constructor(message, statusCode, needTranslate = false) {
        super(message);

        this.name = 'AppError';
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.needTranslate = needTranslate;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppErrorModel;
