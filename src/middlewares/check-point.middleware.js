'use strict';

const {
    catchAsync,
    AppError
} = require('../common/error');
const {
    findCheckPointById
} = require('../services/check-point.service');

module.exports = {
    setCheckPoint: catchAsync(async (req, res, next) => {
        req.checkPoint = await findCheckPointById(req.params.id);
        if (!req.checkPoint) return next(new AppError('error.notFound.checkPoint', 404));
        next();
    })
}
