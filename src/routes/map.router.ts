
import {Router, Request, Response} from 'express';
import {
  AppError,
  catchAsync,
} from '../common/error';
import {
  findMaps,
  createMap,
  updateMap,
  deleteMap,
  findCheckPointsByMap,
  findCheckPointByIdWithThrow,
  updateCheckPointPosition,
} from '../services';
import {setMap} from '../middlewares/map.middleware';
import {CheckPoint} from '../models/check-point.model';
const {uploadSingleImage} = require('../middlewares/upload.middleware');

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
 * // TODO Field controls
 * @return {Map}
 */
mapRouter.post('',
    uploadSingleImage,
    catchAsync(async (req: Request, res: Response) => {
      if (! req.file) {
        throw new AppError('error.notFound.map.image', 404);
      }
      const {name, assetId} = req.body;
      return res.status(200).json(
          await createMap(name, req.file.path, assetId),
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
 * // TODO Field controls
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
 * Delete a Map if map includes any checkPoints
 * Before delete, update maps of asset (remove)
 * @returns {Promise<{n, deletedCount, ok}>}
 */
mapRouter.delete('/:id',
    setMap,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await deleteMap(req.map!._id));
    }),
);

/**
 * Get a Map CheckPoints by id
 * @return {CheckPoint[]}
 */
mapRouter.get('/:id/checkPoint',
    setMap,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await findCheckPointsByMap(req.map!._id));
    }),
);

/**
 * Update a Map checkPoint position
 * If checkpoint map and request map is not match throw error
 * If map is not mapped throw error
 * If given positions do not fit into map, throw error
 * After update, update asset maps (remove, add or update)
 * // TODO Field controls
 * @return {Map}
 */
mapRouter.put('/:id/checkPoint/:checkPointId/position',
    setMap,
    catchAsync(async (req: Request, res: Response) => {
      const checkPoint: CheckPoint = await findCheckPointByIdWithThrow(
          req.params.checkPointId,
      );

      if (!checkPoint.map || !checkPoint.map._id.equals(req.map?._id)) {
        throw new AppError('error.notFound.checkPoint', 404);
      }

      if (! req.map?.width || ! req.map?.height) {
        throw new AppError('error.notMapped.map', 422);
      }

      const {x, y} = req.body;

      if (x < 0 || y < 0 || x > req.map.width || y > req.map.height) {
        throw new AppError('error.positionNotFit.map', 422);
      }

      return res.status(200).json(await updateCheckPointPosition(
          checkPoint._id,
          x,
          y,
      ));
    }),
);

export default mapRouter;
