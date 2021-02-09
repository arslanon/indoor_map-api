import {Router, Request, Response} from 'express';

import {
    catchAsync,
} from '../common/error';
import {
    findCheckPointsByMap,
    createCheckPointWithCSV
} from '../services';
import { setCheckPoint } from '../middlewares/check-point.middleware'
import { uploadCSVFile } from '../middlewares/upload-image.middleware'
const checkPointRouter = Router();

/**
 * Get all Check Points By Map
 */
checkPointRouter.get('/:id',
    setCheckPoint,
    catchAsync(async (req: Request, res: Response) => {
        const {checkPoint} = req.body;
        return res.status(200).json(await findCheckPointsByMap(checkPoint!.map));
    })
);

/**
 * Create a Check point
 * After create, update check point (add)
 * @return {}
 */
checkPointRouter.post('/csv',
    uploadCSVFile,
    catchAsync(async (req: Request, res: Response) => {
        const {assetId, mapId} = req.body;
        return res.status(200).send(await createCheckPointWithCSV(req.file?.path, assetId, mapId));
    })
);

export default checkPointRouter;
