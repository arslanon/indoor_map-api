'use strict';

const { CheckPointModel } = require("../models/check-point.model");
const {
    findAssetById,
    addCheckPointIntoAsset,
    updateCheckPointInAsset,
    removeCheckPointFromAsset
} = require("../services/asset.service");
const {
    findMapByIdAndAssetId,
    addCheckPointIntoMap,
    updateCheckPointInMap,
    removeCheckPointFromMap
} = require("../services/map.service");
const { AppError } = require("../common/error");

/**
 * Get all CheckPoints
 * @param {mapId}: map.id
 * @returns {Promise<[CheckPointModel]>}
 */
const findCheckPointsByMap = ({id: mapId}) => {
    return CheckPointModel.find({"map._id": mapId}).select({
        _id: 1,
        name: 1,
        macAddress: 1,
        x: 1,
        y: 1
    });
}

/**
 * Get CheckPoint by id
 * @param id
 * @returns {Promise<CheckPointModel>}
 */
const findCheckPointById = (id) => {
    return CheckPointModel.findOne({_id: id})
        .select({
            _id: 1,
            name: 1,
            macAddress: 1,
            asset: 1,
            map: 1,
            x: 1,
            y: 1
        });
}

/**
 * Get a CheckPoint by id  with throw
 * Throw notFound error if checkPoint not exists
 * @param id
 * @returns {Promise<CheckPointModel>}
 */
const findCheckPointByIdWithThrow = (id) => {
    const checkPoint = findCheckPointById(id);
    if (! checkPoint) throw new AppError('error.notFound.checkPoint', 404);
    return checkPoint;
}

/**
 * Create a CheckPoint
 * After create, update asset checkPoints (add) and map checkPoints (add)
 * TODO Need transaction
 * @param {name, macAddress, assetId, mapId}
 * @returns {Promise<CheckPointModel>}
 */
const createCheckPoint = async ({name, macAddress, assetId, mapId}) => {
    const asset = await findAssetById(assetId);
    const map = await findMapByIdAndAssetId(mapId, asset?._id);

    const checkPoint = new CheckPointModel({name, macAddress, asset, map});
    await checkPoint.save();

    if(asset) await addCheckPointIntoAsset(asset, checkPoint);
    if(map) await addCheckPointIntoMap(map, checkPoint);

    return checkPoint;
}

/**
 * Update a CheckPoint
 * After update, update checkPoints of asset (remove, add or update)
 * After update, update checkPoints of map (remove, add or update)
 * TODO Need transaction
 * @param {id}: checkPoint.id
 * @param {name, macAddress, assetId, mapId}
 * @returns {Promise<CheckPointModel>}
 */
const updateCheckPoint = async ({id}, {name, macAddress, assetId, mapId}) => {
    const checkPoint = await findCheckPointByIdWithThrow(id);
    const asset = await findAssetById(assetId);
    const map = await findMapByIdAndAssetId(mapId, asset?._id);

    const {x, y} = (! checkPoint.map?.equals(map)) ? {} : map;

    const checkPointUpdated = await CheckPointModel.findOneAndUpdate({_id: id}, {
        name,
        macAddress,
        asset,
        map,
        x,
        y
    }, {new: true});

    if(! checkPointUpdated.asset?.equals(checkPoint.asset)) {
        if (checkPoint.asset) await removeCheckPointFromAsset(checkPoint.asset, checkPoint);
        if (checkPointUpdated.asset) await addCheckPointIntoAsset(checkPointUpdated.asset, checkPointUpdated);
    } else {
        if (checkPointUpdated.asset) await updateCheckPointInAsset(checkPointUpdated.asset, checkPointUpdated)
    }

    if(! checkPointUpdated.map?.equals(checkPoint.asset)) {
        if (checkPoint.map) await removeCheckPointFromMap(checkPoint.map, checkPoint);
        if (checkPointUpdated.map) await addCheckPointIntoMap(checkPointUpdated.map || {}, checkPointUpdated);
    } else {
        if (checkPointUpdated.map) await updateCheckPointInMap(checkPointUpdated.map, checkPointUpdated)
    }

    return checkPointUpdated;
}

/**
 * Update a CheckPoint position only
 * @param {id}: checkPoint.id
 * @param {x, y}
 * @returns {Promise<CheckPointModel>}
 */
const updateCheckPointPosition = async ({id}, {x, y}) => {
    return CheckPointModel.findOneAndUpdate({_id: id}, {
        x,
        y
    }, {new: true});
}

/**
 * Delete a CheckPoint
 * Before delete, update checkPoints of asset (remove)
 * Before delete, update checkPoints of map (remove)
 * TODO Need transaction
 * @param id
 * @returns {Promise<{n, deletedCount, ok}>}
 */
const deleteCheckPoint = async (id) => {
    const checkPoint = await findCheckPointByIdWithThrow(id);

    if(checkPoint.asset) await removeCheckPointFromAsset(checkPoint.asset, checkPoint);
    if(checkPoint.map) await removeCheckPointFromMap(checkPoint.map, checkPoint);

    return CheckPointModel.deleteOne({_id: id});
}

// <editor-fold desc="Asset">

/**
 * Update asset of checkPoints
 * @param checkPoints: [CheckPointModel]
 * @param asset: AssetModel
 * @returns {Promise<CheckPointModel>}
 */
const updateAssetOfCheckPoints = async (checkPoints, asset) => {
    return CheckPointModel.updateMany(
        {_id: {$in: checkPoints.map(c => c._id)}},
        {asset: asset}
    );
}

// </editor-fold>

// <editor-fold desc="Map">

/**
 * Update map of checkPoints
 * @param checkPoints: [CheckPointModel]
 * @param map: MapModel
 * @returns {Promise<CheckPointModel>}
 */
const updateMapOfCheckPoints = async (checkPoints, map) => {
    return CheckPointModel.updateMany(
        {_id: {$in: checkPoints.map(c => c._id)}},
        {map: map}
    );
}

// </editor-fold>

module.exports = {
    findCheckPointsByMap,
    findCheckPointById,
    findCheckPointByIdWithThrow,
    createCheckPoint,
    updateCheckPoint,
    updateCheckPointPosition,
    deleteCheckPoint,
    updateAssetOfCheckPoints,
    updateMapOfCheckPoints
}
