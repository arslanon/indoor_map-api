'use strict';

const { AssetModel } = require("../models/asset.model");
const { AppError } = require("../common/error");

/**
 * Get all Assets
 * @returns {Promise<[AssetModel]>}
 */
const findAssets = async () => {
    return AssetModel.find()
        .select({
            _id: 1,
            name: 1
        });
}

/**
 * Get Asset by id
 * @param id
 * @returns {Promise<AssetModel>}
 */
const findAssetById = async (id) => {
    return AssetModel.findOne({_id: id})
        .select({
            _id: 1,
            name: 1,
            maps: 1,
            checkPoints: 1
        });
}

/**
 * Get Asset by id with throw
 * Throw notFound error if asset not exists
 * @param id
 * @returns {Promise<AssetModel>}
 */
const findAssetByIdWithThrow = async (id) => {
    const asset = await findAssetById(id);
    if (! asset) throw new AppError('error.notFound.asset', 404);
    return asset;
}

/**
 * Create an Asset
 * @param {name, assetId}
 * @returns {Promise<AssetModel>}
 */
const createAsset = async ({name}) => {
    const asset = new AssetModel({name});
    return asset.save();
}

/**
 * Update Asset attributes
 * After update, update asset of maps (update)
 * After update, update asset of checkPoints (update)
 * TODO Need transaction
 * @param asset
 * @param {name}
 * @returns {Promise<AssetModel>}
 */
const updateAsset = async (asset, {name}) => {
    const assetUpdated = await AssetModel.findOneAndUpdate(
        {_id: asset._id},
        {name: name},
        {new: true}
    );

    await updateAssetOfMaps(asset.maps || [], assetUpdated);
    await updateAssetOfCheckPoints(asset.checkPoints || [], assetUpdated);

    return assetUpdated;
}

/**
 * Delete a Asset if asset includes any maps or checkPoints
 * @param id
 * @returns {Promise<{n, deletedCount, ok}>}
 */
const deleteAsset = async (id) => {
    const asset = await findAssetByIdWithThrow(id);

    if (asset.maps.length > 0) throw new AppError('error.delete.asset.mapsExists', 400);
    if (asset.checkPoints.length > 0) throw new AppError('error.delete.asset.checkpointsExists', 400);

    // await updateAssetOfMaps(asset.maps || [], undefined);
    // await updateAssetOfCheckPoints(asset.checkPoints || [], undefined);

    return AssetModel.deleteOne({_id: id})
}

// <editor-fold desc="Map">

/**
 * Add map into assets
 * => It pushes new map into asset.maps
 * @param {id}: asset.id
 * @param map: {MapModel}
 * @returns {Promise<AssetModel>}
 */
const addMapIntoAsset = async ({id}, map) => {
    return AssetModel.findOneAndUpdate(
        {_id: id},
        {$push: {maps: map}},
        {new: true}
    );
}

/**
 * Update map in asset
 * => It updates a map in asset.maps
 * @param {id}: asset.id
 * @param map: {MapModel}
 * @returns {Promise<AssetModel>}
 */
const updateMapInAsset = async ({id}, map) => {
    return AssetModel.findOneAndUpdate(
        {_id: id, 'maps._id': map._id},
        {'maps.$': map},
        {new: true}
    );
}

/**
 * Remove map from asset
 * => It pulls a map from asset.maps
 * @param {id}: asset.id
 * @param map: {MapModel}
 * @returns {Promise<{n, nModified, ok}>}
 */
const removeMapFromAsset = async ({id}, map) => {
    return AssetModel.updateMany(
        {_id: id},
        {
            $pull: {
                maps: {_id: map._id}
            }
        }
    );
}

// </editor-fold>

// <editor-fold desc="CheckPoint">

/**
 * Add checkPoint into asset
 * => It pushes new checkPoint into asset.checkPoints
 * @param {id}: asset.id
 * @param checkPoint: {CheckPointModel}
 * @returns {Promise<AssetModel>}
 */
const addCheckPointIntoAsset = async ({id}, checkPoint) => {
    return AssetModel.findOneAndUpdate(
        {_id: id},
        {$push: {checkPoints: checkPoint}},
        {new: true}
    );
}

/**
 * Update checkPoint in asset
 * => It updates a checkPoint in asset.checkPoints
 * @param {id}: asset.id
 * @param checkPoint: {CheckPointModel}
 * @returns {Promise<AssetModel>}
 */
const updateCheckPointInAsset = async ({id}, checkPoint) => {
    return AssetModel.findOneAndUpdate(
        {_id: id, 'checkPoints._id': checkPoint._id},
        {'checkPoints.$': checkPoint},
        {new: true}
    );
}

/**
 * Remove checkPoint from asset
 * => It pulls a checkPoint from asset.checkPoints
 * @param {id}: asset.id
 * @param checkPoint: {CheckPointModel}
 * @returns {Promise<{n, nModified, ok}>}
 */
const removeCheckPointFromAsset = async ({id}, checkPoint) => {
    return AssetModel.updateMany(
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
    findAssets,
    findAssetById,
    findAssetByIdWithThrow,
    createAsset,
    updateAsset,
    deleteAsset,
    addMapIntoAsset,
    removeMapFromAsset,
    updateMapInAsset,
    addCheckPointIntoAsset,
    updateCheckPointInAsset,
    removeCheckPointFromAsset,
}

const { updateAssetOfMaps } = require('./map.service');
const { updateAssetOfCheckPoints } = require('./check-point.service');