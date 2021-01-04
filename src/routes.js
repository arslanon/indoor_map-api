const express = require('express')
const router = new express.Router()
const upload = require('./shared/map-multer')
const { parse } = require('./shared/tile-layers-parser')
const {
    getAssets,
    getMeters,
    getMaps,
    getMap,
    createMap,
    updateMap,
    createMapMeterMarker,
    updateMapMeterMarker
} = require('./db')

/**
 * Get all assets
 */
router.get('/asset', async (req, res) => {
    res.status(200).json(await getAssets());
})

/**
 * Get all meters
 */
router.get('/meter', async (req, res) => {
    res.status(200).json(await getMeters());
})

/**
 * Get all maps
 */
router.get('/map', async (req, res) => {
    res.status(200).json(await getMaps());
});

/**
 * Get a map by id
 */
router.get('/map/:id', async (req, res) => {
    res.status(200).json(await getMap(req.params.id));
});

/**
 * Create a map with an image
 */
router.post('/map', upload, async (req, res, next) => {

    if(!req.file) res.status(404).send({message: 'File is not found!'})

    const map = await createMap(req.body)
    const {path, width, height, maxZoom} = await parse(req.file.path, map.id);

    return res.status(200).json(
        await updateMap(map.id, {
            ...map,
            path,
            width,
            height,
            maxZoom,
        })
    )
});

/**
 * Create a meter marker
 */
router.post('/map/:id/meterMarker', async (req, res) => {
    console.log(req.body);
    if(! req.body) {
        res.status(400).json({message: 'Marker body is not found!'})
    } else {
        res.status(200).json(await createMapMeterMarker(req.params.id, req.body));
    }
});

/**
 * Update a meter marker
 */
router.put('/map/:mapId/meterMarker/:meterId', async (req, res) => {
    console.log(req.body);
    if(! req.body) {
        res.status(400).json({message: 'Marker body is not found!'})
    } else {
        res.status(200).json(await updateMapMeterMarker(req.params.mapId, req.params.meterId, req.body));
    }
});

module.exports = router;