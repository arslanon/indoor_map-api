'use strict';

const express = require('express');
const router = new express.Router();
const {
    catchAsync
} = require('../common/error');
const {
    findAssets,
    createAsset,
    updateAsset,
    deleteAsset
} = require('../services/asset.service');
const { setAsset } = require('../middlewares/asset.middleware');

/**
 * Get all Maps
 */
router.get('',
    catchAsync(async (req, res) => {
        return res.status(200).json(await findAssets());
    })
);

/**
 * Create a Map and update after image parsing
 * After create, update asset maps (add)
 * @return {MapModel}
 */
router.post('',
    catchAsync(async (req, res) => {
        return res.status(200).json(await createAsset(req.body));
    })
);

router.get('/:id',
    setAsset,
    catchAsync(async (req, res) => {
        return res.status(200).json(req.asset);
    })
);

router.put('/:id',
    setAsset,
    catchAsync(async (req, res) => {
        return res.status(200).json(await updateAsset(req.asset, req.body));
    })
);

router.delete('/:id',
    setAsset,
    catchAsync(async (req, res) => {
        return res.status(200).json(await deleteAsset(req.asset.id));
    })
);

module.exports = router
