import {Router, Request, Response} from 'express';

import {
  catchAsync,
} from '../common/error';
import {
  findCheckPointsByMap,
  upsertCheckPointWithCSV,
} from '../services';
import {setCheckPoint} from '../middlewares/check-point.middleware';
import {uploadCSVFile} from '../middlewares/upload.middleware';

// eslint-disable-next-line new-cap
const checkPointRouter = Router();

/**
 * Get a Check Point
 */
checkPointRouter.get('/:id',
    setCheckPoint,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(req.checkPoint);
    })
);

/**
 * Create a Check Point
 * After create, update check point (add)
 * @return {}
 */
checkPointRouter.post('/csv',
    uploadCSVFile,
    catchAsync(async (req: Request, res: Response) => {
      const {assetId, mapId} = req.body;
      return res.status(200).send(
          await upsertCheckPointWithCSV(req.file?.path, assetId, mapId),
      );
    })
);

export default checkPointRouter;
