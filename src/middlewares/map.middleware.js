'use strict';

const {
    catchAsync,
    AppError
} = require('../common/error')
const {
    findMapById
} = require('../services/map.service')

module.exports = {
    setMap: catchAsync(async (req, res, next) => {
        req.map = await findMapById(req.params.id);
        if (!req.map) return next(new AppError('error.notFound.map', 404))
        next()
    })
}
