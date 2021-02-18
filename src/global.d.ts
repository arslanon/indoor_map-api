/* eslint-disable no-unused-vars */

declare namespace Express {
    export interface Request {
        asset?: import('./models/asset.model').Asset;
        map?: import('./models/map.model').Map;
        checkPoint?: import('./models/check-point.model').CheckPoint;
        language: string;
        languages: string[];
        i18n: import('i18next').i18n;
        t: import('i18next').TFunction;
    }
}
