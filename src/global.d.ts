/* eslint-disable no-unused-vars */
declare namespace Express {
    export interface Request {
        asset?: import('./models/asset.model').Asset;
        map?: import('./models/map.model').Map;
        checkPoint?: import('./models/check-point.model').CheckPoint;
    }
}
