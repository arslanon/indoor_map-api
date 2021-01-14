'use strict';

const express = require('express')
const router = new express.Router()
const {
    catchAsync
} = require('../common/error')
const {
    findMaps,
    createMap,
    updateMap,
    deleteMap
} = require('../services/map.service')
const {
    findCheckPointByIdWithThrow,
    updateCheckPointPosition
} = require('../services/check-point.service')
const { setMap } = require('../middlewares/map.middleware')
const { uploadSingleImage } = require('../middlewares/upload-image.middleware')

/**
 * Get all Maps
 */
router.get('',
    catchAsync(async (req, res) => {
        return res.status(200).json(await findMaps());
    })
)

/**
 * Create a Map
 * After create, update asset maps (add)
 * @return {MapModel}
 */
router.post('',
    uploadSingleImage,
    catchAsync(async (req, res) => {
        return res.status(200).json(
            await createMap(req.body, req.file?.path)
        );
    })
);

/**
 * Get a Map by id
 * @return {MapModel}
 */
router.get('/:id',
    setMap,
    catchAsync(async (req, res) => {
        return res.status(200).json(req.map);
    })
);

/**
 * Update a Map
 * After update, update asset maps (remove, add or update)
 * @return {MapModel}
 */
router.put('/:id',
    setMap,
    uploadSingleImage,
    catchAsync(async (req, res) => {
        return res.status(200).json(
            await updateMap(req.map, req.body, req.file ? req.file.path : undefined)
        );
    })
);

/**
 * Update a Map checkPoint
 * After update, update asset maps (remove, add or update)
 * @return {MapModel}
 */
router.put('/:id/checkPoint/:checkPointId',
    setMap,
    uploadSingleImage,
    catchAsync(async (req, res) => {

        const checkPoint = await findCheckPointByIdWithThrow(req.params.checkPointId);

        const {x, y} = req.body;
        const checkPointUpdated = await updateCheckPointPosition(checkPoint, {
                x,
                y
            }
        );

        return res.status(200).json(checkPointUpdated);
    })
);

/**
 * Delete a Map
 * Before delete, update asset maps (remove)
 */
router.delete('/:id',
    setMap,
    catchAsync(async (req, res) => {
        return res.status(200).json(await deleteMap(req.map.id));
    })
);

module.exports = router
