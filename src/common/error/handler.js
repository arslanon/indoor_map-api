
const logger = require('../logger');
const {
    handleCastError,
    handleDuplicateFieldsError,
    handleValidationError
} = require('./handlers/mongoose');

/**
 * Return error model for dev environment
 * @param err
 * @param res
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        time: new Date(),
        error: err,
        message: err.message,
        stack: err.stack
    });
}

/**
 * Return error model for prod environment
 * @param err
 * @param res
 */
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            time: new Date(),
            message: err.message,
        });
    } else {
        logger.error(`ERROR 💥`, { err: err, pid: process.pid });

        res.status(500).json({
            status: 'error',
            time: new Date(),
            message: res.__('error.bad_request')
        });
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'dev') {
        sendErrorDev(err, res);
    } else if(process.env.NODE_ENV === 'prod') {
        let error = { ...err };
        error.message = err.needTranslate ? res.__(err.message) : err.message
        error.name = err.name
        if (error.name === 'CastError') { error = handleCastError(error, res); }
        else if (error.name === 'MongoError' && error.code === 11000) { error = handleDuplicateFieldsError(error, res); }
        else if (error.name === 'ValidationError') { error = handleValidationError(error, res); }
        sendErrorProd(error, res);
    }
};
