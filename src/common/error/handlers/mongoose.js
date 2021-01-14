
const AppError = require('../models/app-error.model');

/**
 * Handle cast error
 * @param err
 * @param res
 * @returns {AppError}
 */
const handleCastError = (err, res) => {
    const message = res.__('error.db.invalid', { path: err.path, value: err.value });
    return new AppError(message, 400)
}

/**
 * Handle duplicate fields error
 * @param err
 * @param res
 * @returns {AppError}
 */
const handleDuplicateFieldsError = (err, res) => {
    const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0].toString().replace(/["']/g, "");
    const message = res.__('error.db.duplicate_field', { value });
    return new AppError(message, 400);
}

/**
 * Handle validation error
 * @param err
 * @param res
 * @returns {AppError}
 */
const handleValidationError = (err, res) => {
    let message = []
    let messageDuplicates = []
    Object.entries(err.errors).forEach(([key, value]) => {
        switch (value.kind) {
            case "required":
                message.push(res.__("validation." + value.path + "." + value.kind))
                break;
            case "unique":
                message.push(res.__("validation." + value.path + "." + value.kind))
                break;
            case "minlength":
                const minLength = value.properties.minlength
                message.push( res.__("validation." + value.path + "." + value.kind, { minLength }))
                break;
            case "maxlength":
                const maxLength = value.properties.maxlength
                message.push( res.__("validation." + value.path + "." + value.kind, { maxLength }))
                break;
            case "duplicate":
                if(! messageDuplicates.find(msg => msg === value.message)) {
                    message.push(res.__("validation." + value.message))
                    messageDuplicates.push(value.message)
                }
                break;
            default:
                message.push(res.__(value.message))
                break;
        }
    });

    return new AppError(message.join(" "), 404)
}

module.exports = {
    handleCastError,
    handleDuplicateFieldsError,
    handleValidationError
}
