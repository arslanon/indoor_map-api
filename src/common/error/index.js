
const appError = require('./models/app-error.model');
const handler = require('./handler');
const catchAsync = require('./catchAsync');

module.exports = {
    AppError: appError,
    errorHandler: handler,
    catchAsync
}
