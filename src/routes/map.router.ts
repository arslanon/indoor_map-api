
import {Router, Request, Response} from 'express';
import {
  catchAsync,
} from '../common/error';
import {
  findMaps,
  createMap,
  updateMap,
  deleteMap,
} from '../services/map.service';
import {
  findCheckPointByIdWithThrow,
  updateCheckPointPosition,
} from '../services/check-point.service';
import {setMap} from '../middlewares/map.middleware';
const {uploadSingleImage} = require('../middlewares/upload-image.middleware');

// eslint-disable-next-line new-cap
const mapRouter = Router();

/**
 * Get all Maps
 * @return {Map[]}
 */
mapRouter.get('',
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await findMaps());
    }),
);

/**
 * Create a Map
 * If image exists, update after image parsing
 * After create, update asset maps (add)
 * @return {Map}
 */
mapRouter.post('',
    uploadSingleImage,
    catchAsync(async (req: Request, res: Response) => {
      const {name, assetId} = req.body;
      return res.status(200).json(
          await createMap(name, assetId, req.file?.path),
      );
    }),
);

/**
 * Get a Map by id
 * @return {Map}
 */
mapRouter.get('/:id',
    setMap,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(req.map);
    }),
);

/**
 * Update a Map
 * After update, update maps in asset (remove, add or update)
 * After update, update map of checkPoints (update)
 * @return {Map}
 */
mapRouter.put('/:id',
    setMap,
    uploadSingleImage,
    catchAsync(async (req: Request, res: Response) => {
      const {name, assetId} = req.body;
      return res.status(200).json(
          await updateMap(
            req.map!,
            name,
            assetId,
            req.file ? req.file.path : undefined,
          ),
      );
    }),
);

/**
 * Update a Map checkPoint
 * After update, update asset maps (remove, add or update)
 * @return {Map}
 */
mapRouter.put('/:id/checkPoint/:checkPointId',
    setMap,
    uploadSingleImage,
    catchAsync(async (req: Request, res: Response) => {
      const checkPoint = await findCheckPointByIdWithThrow(
          req.params.checkPointId,
      );

      const {x, y} = req.body;
      const checkPointUpdated = await updateCheckPointPosition(
          checkPoint._id,
          x,
          y,
      );

      return res.status(200).json(checkPointUpdated);
    }),
);

/**
 * Delete a Map if map includes any checkPoints
 * Before delete, update maps of asset (remove)
 * @returns {Promise<{n, deletedCount, ok}>}
 */
mapRouter.delete('/:id',
    setMap,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await deleteMap(req.map!.id));
    }),
);

export default mapRouter;
