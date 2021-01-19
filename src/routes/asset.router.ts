
import {Router, Request, Response} from 'express';
import {
  catchAsync,
} from '../common/error';
import {
  findAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../services/asset.service';
import {setAsset} from '../middlewares/asset.middleware';

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
      return res.status(200).json(await deleteAsset(req.asset!.id));
    }),
);

export default assetRouter;
