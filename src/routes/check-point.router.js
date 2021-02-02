'use strict';

const express = require('express');
const router = new express.Router();
const {
    catchAsync
} = require('../common/error');
const {
    findCheckPointsByMap,
    createCheckPointWithCSV,
} = require('../services/check-point.service');
const { setCheckPoint } = require('../middlewares/check-point.middleware');
const {uploadCSVFile} = require('../middlewares/upload-image.middleware')

/**
 * Get all Check Points By Map
 */
router.get('/:id',
    setCheckPoint,
    catchAsync(async (req, res) => {
        return res.status(200).json(await findCheckPointsByMap(req.checkPoint.map));
    })
);

/**
 * Create a Check point
 * After create, update check point (add)
 * @return {MapModel}
 */
router.post('/csv',
    uploadCSVFile,
    catchAsync(async (req, res) => {
        return res.status(200).send(await createCheckPointWithCSV(req.body, req.file));
    })
);

module.exports = router
