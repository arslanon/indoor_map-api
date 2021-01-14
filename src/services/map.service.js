'use strict';

const { MapModel } = require("../models/map.model");
const {
    findAssetById,
    addMapIntoAsset,
    updateMapInAsset,
    removeMapFromAsset
} = require("./asset.service");
const { AppError } = require("../common/error");
const { parse } = require('./../shared/image-tile.parser')

/**
 * Get all Maps
 * @returns {Promise<[MapModel]>}
 */
const findMaps = () => {
    return MapModel.find()
        .select({
            _id: 1,
            name: 1,
            asset: 1
        });
}

/**
 * Get Map by id
 * @param id
 * @returns {DocumentQuery<MapModel>}
 */
const findMapById = (id) => {
    return MapModel.findOne({_id: id})
        .select({
            _id: 1,
            name: 1,
            asset: 1,
            path: 1,
            width: 1,
            height: 1,
            maxZoom: 1,
            checkPoints: 1
        });
}

/**
 * Get Map by id and asset.id
 * @param id
 * @param assetId
 * @returns {DocumentQuery<MapModel>}
 */
const findMapByIdAndAssetId = (id, assetId) => {
    return MapModel.findOne({_id: id, 'asset._id': assetId})
        .select({
            _id: 1,
            name: 1,
            asset: 1,
            path: 1,
            width: 1,
            height: 1,
            maxZoom: 1,
            meterMarkers: 1
        });
}

/**
 * Get a Map by id  with throw
 * Throw notFound error if map not exists
 * @param id
 * @returns {Promise<MapModel>}
 */
const findMapByIdWithThrow = async (id) => {
    const map = await findMapById(id);
    if (! map) throw new AppError('error.notFound.map', 404);
    return map;
}

/**
 * Create a Map
 * After create, update asset maps (add)
 * TODO Need transaction
 * @param {name, assetId}
 * @param filePath: image file path
 * @returns {Promise<MapModel>}
 */
const createMap = async ({name, assetId}, filePath) => {
    const asset = await findAssetById(assetId);
    const map = new MapModel({name, asset});
    await map.save();

    if(asset) await addMapIntoAsset(asset, map);

    if (!filePath) return map;

    return await updateMap(
        map,
        {
            name,
            assetId
        },
        filePath)
}

/**
 * Update a Map
 * After update, update maps of asset (remove, add or update)
 * After update, update map of checkPoints (update)
 * TODO Need transaction
 * @param {id}
 * @param {name, assetId, path, width, height, maxZoom, meterMarkers}
 * @param filePath: image file path
 * @returns {Promise<MapModel>}
 */
const updateMap = async ({id}, {name, assetId}, filePath = undefined) => {
    const map = await findMapByIdWithThrow(id);
    const asset = await findAssetById(assetId);

    // TODO Old image path needs to be deleted if exists
    const {path, width, height, maxZoom} = filePath ? await parse(filePath, map._id) : map;

    const mapUpdated = await MapModel.findOneAndUpdate({_id: id}, {
        name,
        asset,
        path,
        width,
        height,
        maxZoom
    }, {new: true});

    if(! mapUpdated.asset?.equals(map.asset)) {
        if(map.asset) await removeMapFromAsset(map.asset, map);
        if(mapUpdated.asset) await addMapIntoAsset(mapUpdated.asset, mapUpdated);
    } else {
        if(mapUpdated.asset) await updateMapInAsset(mapUpdated.asset, mapUpdated);
    }

    await updateMapOfCheckPoints(mapUpdated.checkPoints || [], mapUpdated);

    return mapUpdated;
}

/**
 * Delete a Map if map includes any checkPoints
 * Before delete, update maps of asset (remove)
 * TODO Need transaction
 * @param id
 * @returns {Promise<{n, deletedCount, ok}>}
 */
const deleteMap = async (id) => {
    const map = await findMapByIdWithThrow(id);

    if (map.checkPoints.length > 0) throw new AppError('error.delete.map.checkpointsExists', 400);

    // TODO Image tile path needs to be deleted

    if(map.asset) await removeMapFromAsset(map.asset, map);

    // await updateMapOfCheckPoints(map.checkPoints || [], undefined);

    return MapModel.deleteOne({_id: id});
}

// <editor-fold desc="Asset">

/**
 * Update asset of maps
 * @param maps: [MapModel]
 * @param asset: AssetModel | undefined
 * @returns {Promise<MapModel>}
 */
const updateAssetOfMaps = async (maps, asset) => {
    return MapModel.updateMany(
        {_id: {$in: maps.map(m => m._id)}},
        {asset: asset}
    );
}

// </editor-fold>

// <editor-fold desc="CheckPoint">

/**
 * Add checkPoint into map
 * => It pushes new checkPoint into map.checkPoints
 * @param {id}: map.id
 * @param checkPoint: {CheckPointModel}
 * @returns {Promise<MapModel>}
 */
const addCheckPointIntoMap = async ({id}, checkPoint) => {
    return MapModel.findOneAndUpdate(
        {_id: id},
        {$push: {checkPoints: checkPoint}},
        {new: true}
    );
}

/**
 * Update checkPoint in map
 * => It updates a checkPoint in map.checkPoints
 * @param {id}: map.id
 * @param checkPoint: {CheckPointModel}
 * @returns {Promise<MapModel>}
 */
const updateCheckPointInMap = async ({id}, checkPoint) => {
    return MapModel.findOneAndUpdate(
        {_id: id, 'checkPoints._id': checkPoint._id},
        {'checkPoints.$': checkPoint},
        {new: true}
    );
}

/**
 * Remove checkPoint from map
 * => It pulls a checkPoint from map.checkPoints
 * @param {id}: map.id
 * @param checkPoint: {CheckPointModel}
 * @returns {Promise<{n, nModified, ok}>}
 */
const removeCheckPointFromMap = async ({id}, checkPoint) => {
    return MapModel.updateMany(
        {_id: id},
        {
            $pull: {
                checkPoints: {_id: checkPoint._id}
            }
        }
    );
}

// </editor-fold>

module.exports = {
    findMaps,
    findMapById,
    findMapByIdAndAssetId,
    findMapByIdWithThrow,
    createMap,
    updateMap,
    deleteMap,
    updateAssetOfMaps,
    addCheckPointIntoMap,
    updateCheckPointInMap,
    removeCheckPointFromMap
}

const { updateMapOfCheckPoints } = require('./check-point.service');