'use strict';

const {
    catchAsync,
    AppError
} = require('../common/error');
const {
    findAssetById
} = require('../services/asset.service');

module.exports = {
    setAsset: catchAsync(async (req, res, next) => {
        req.asset = await findAssetById(req.params.id);
        if (!req.asset) return next(new AppError('error.notFound.asset', 404));
        next();
    })
}
