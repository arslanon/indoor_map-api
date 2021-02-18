import {Router, Request, Response} from 'express';

import {
  catchAsync,
} from '../common/error';
import {
  findCheckPoints,
  upsertCheckPointWithCSV,
  updateCheckPointPosition,
  setCheckPointMap,
  unsetCheckPointMap
} from '../services';
import {setCheckPoint} from '../middlewares/check-point.middleware';
import {uploadCSVFile} from '../middlewares/upload.middleware';

// eslint-disable-next-line new-cap
const checkPointRouter = Router();

/**
 * Get all CheckPoints
 * @return {CheckPoint[]}
 */
checkPointRouter.get('',
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await findCheckPoints());
    }),
);

/**
 * Get a CheckPoint
 * @return {CheckPoint}
 */
checkPointRouter.get('/:checkPointId',
    setCheckPoint,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(req.checkPoint);
    })
);

/**
 * Create CheckPoints via CSV
 * TODO Field controls
 * @return {CheckPoint[]}
 */
checkPointRouter.post('/csv',
    uploadCSVFile,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).send(
          await upsertCheckPointWithCSV(req.file?.path),
      );
    })
);

/**
 * Set a CheckPoint map
 * TODO Field controls
 * @return {CheckPoint}
 */
checkPointRouter.post('/:checkPointId/map',
    setCheckPoint,
    catchAsync(async (req: Request, res: Response) => {
      const {mapId, x, y} = req.body;
      return res.status(200).json(
          await setCheckPointMap(req.checkPoint?._id, mapId, x, y)
      );
    })
);

/**
 * Unset a CheckPoint map
 * @return {CheckPoint}
 */
checkPointRouter.post('/:checkPointId/unmap',
    setCheckPoint,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(
          await unsetCheckPointMap(req.checkPoint?._id)
      );
    })
);

/**
 * Update a CheckPoint position
 * TODO Field controls
 * @return {CheckPoint}
 */
checkPointRouter.put('/:checkPointId/position',
    setCheckPoint,
    catchAsync(async (req: Request, res: Response) => {
      const {x, y} = req.body;
      return res.status(200).json(
          await updateCheckPointPosition(req.checkPoint?._id, x, y)
      );
    })
);

export default checkPointRouter;
