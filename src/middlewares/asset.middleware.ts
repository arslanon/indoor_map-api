
import {
  catchAsync,
  AppError,
} from '../common/error';
import {
  findAssetById,
} from '../services/asset.service';
import {Request, Response, NextFunction} from 'express';

export const setAsset = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      req.asset = await findAssetById(req.params.id) || undefined;
      if (!req.asset) return next(new AppError('error.notFound.asset', 404));
      next();
    },
);
