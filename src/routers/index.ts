import express, {Router} from 'express';
import assetRouter from './asset.router';
import mapRouter from './map.router';
import checkPointRouter from './check-point.router';

// eslint-disable-next-line new-cap
const routes = Router();

routes.use('/api/asset', assetRouter);
routes.use('/api/map', mapRouter);
routes.use('/api/checkPoint', checkPointRouter);
routes.use('/uploads', express.static('./uploads'));

export default routes;
