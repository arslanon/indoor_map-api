
import {Router, Request, Response} from 'express';
import {
  catchAsync,
} from '../common/error';
import {
  findAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  findMapsByAsset,
  findCheckPointsByAsset
} from '../services';
import {setAsset} from '../middlewares/asset.middleware';
import mapRouter from './map.router';

// eslint-disable-next-line new-cap
const assetRouter = Router();

/**
 * Get all Assets
 * @return {Asset[]}
 */
assetRouter.get('',
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await findAssets());
    }),
);

/**
 * Create an Asset
 * After create, update asset maps (add)
 * // TODO Field controls
 * @return {Asset}
 */
assetRouter.post('',
    catchAsync(async (req: Request, res: Response) => {
      const {name} = req.body;
      return res.status(200).json(await createAsset(name));
    }),
);

/**
 * Get an Asset by id
 * @return {Asset}
 */
assetRouter.get('/:id',
    setAsset,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(req.asset);
    }),
);

/**
 * Update an Asset
 * After update, update asset of maps (update)
 * After update, update asset of checkPoints (update)
 * // TODO Field controls
 * @return {Asset}
 */
assetRouter.put('/:id',
    setAsset,
    catchAsync(async (req: Request, res: Response) => {
      const {name} = req.body;
      return res.status(200).json(await updateAsset(req.asset!, name));
    }),
);

/**
 * Delete an Asset if asset includes any maps or checkPoints
 * @returns {Promise<{n, deletedCount, ok}>}
 */
assetRouter.delete('/:id',
    setAsset,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await deleteAsset(req.asset!._id));
    }),
);

/**
 * Get an Asset maps by id
 * @return {Map[]}
 */
assetRouter.get('/:id/map',
    setAsset,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await findMapsByAsset(req.asset!._id));
    }),
);

/**
 * Get an Asset checkPoints by id
 * @return {CheckPoint[]}
 */
assetRouter.get('/:id/checkPoint',
    setAsset,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await findCheckPointsByAsset(req.asset!._id));
    }),
);

export default assetRouter;
