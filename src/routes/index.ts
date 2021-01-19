import express, {Router} from 'express';
import assetRouter from './asset.router';
import mapRouter from './map.router';

// eslint-disable-next-line new-cap
const routes = Router();

routes.use('/api/asset', assetRouter);
routes.use('/api/map', mapRouter);
routes.use('/uploads', express.static('./uploads'));

export default routes;
