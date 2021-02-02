/**
 * AppError class to handle all errors thrown in app
 */
export default class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    needTranslate: boolean;

    code?: number;
    path?: string;
    value?: string;
    errors?: any[];

    /**
     * @param {string} message: Error Message
     * @param {number} statusCode
     * @param {boolean} needTranslate
     */
    constructor(
        message: string,
        statusCode: number,
        needTranslate: boolean = false) {
      super(message);

      this.name = 'AppError';
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      this.needTranslate = needTranslate;

      Error.captureStackTrace(this, this.constructor);
    }
}
