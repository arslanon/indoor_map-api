
import {
  catchAsync,
  AppError,
} from '../common/error';
import {
  findCheckPointById,
} from '../services';
import {Request, Response, NextFunction} from 'express';

export const setCheckPoint = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      req.checkPoint = await findCheckPointById(req.params.id) || undefined;
      if (!req.checkPoint) {
        return next(new AppError('error.notFound.checkPoint', 404));
      }
      next();
    },
);
