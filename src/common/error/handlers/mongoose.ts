
import AppError from '../models/app-error.model';
import {Response} from 'express';

/**
 * Handle cast error
 * @param {AppError} err
 * @param {Response} res
 * @return {AppError}
 */
export function handleCastError(err: AppError, res: Response) {
  const message = 'error.db.invalid ' + err.path + ' ' + err.value;
  return new AppError(message, 400);
}

/**
 * Handle duplicate fields error
 * @param {AppError} err
 * @param {Response} res
 * @return {AppError}
 */
export function handleDuplicateFieldsError(err: AppError, res: Response) {
  const value = err.message
      .match(/(["'])(?:(?=(\\?))\2.)*?\1/)![0]
      .toString()
      .replace(/["']/g, '');
  const message = 'error.db.duplicate_field ' + value;
  return new AppError(message, 400);
}

/* eslint-disable max-len */
/**
 * Handle validation error
 * @param {AppError} err
 * @param {Response} res
 * @return {AppError}
 */
export function handleValidationError(err: AppError, res: Response) {
  const message: string[] = [];
  const messageDuplicates: string[] = [];
  if (err.errors) {
    Object.entries(err.errors).forEach(([key, value]) => {
      switch (value.kind) {
        case 'required':
          message.push('validation.' + value.path + '.' + value.kind);
          break;
        case 'unique':
          message.push('validation.' + value.path + '.' + value.kind);
          break;
        case 'minlength':
          const minLength = value.properties.minlength;
          message.push('validation.' + value.path + '.' + value.kind + ' ' + minLength);
          break;
        case 'maxlength':
          const maxLength = value.properties.maxlength;
          message.push('validation.' + value.path + '.' + value.kind + ' ' + maxLength);
          break;
        case 'duplicate':
          if (! messageDuplicates.find((msg) => msg === value.message)) {
            message.push('validation.' + value.message);
            messageDuplicates.push(value.message);
          }
          break;
        default:
          message.push(value.message);
          break;
      }
    });
  }

  return new AppError(message.join(' '), 404);
}
