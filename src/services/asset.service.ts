
import AssetDoc, {Asset} from '../models/asset.model';
import {Map} from '../models/map.model';
import {CheckPoint} from '../models/check-point.model';
import {AppError} from '../common/error';
import {
  updateAssetOfMaps,
  updateAssetOfCheckPoints,
} from './';

/**
 * Get all Assets
 * @return {Promise<Asset[]>}
 */
export async function findAssets(): Promise<Asset[]> {
  return AssetDoc.find()
      .select({
        _id: 1,
        name: 1,
      });
}

/**
 * Get Asset by id
 * @param {string} id
 * @return {Promise<Asset | null>}
 */
export async function findAssetById(id: string) {
  return AssetDoc.findOne({_id: id})
      .select({
        _id: 1,
        name: 1,
        maps: 1,
        checkPoints: 1,
      });
}

/**
 * Get an Asset by id with throw
 * Throw notFound error if asset not exists
 * @param {string} id
 * @return {Promise<Asset>}
 */
export async function findAssetByIdWithThrow(id: string) {
  const asset: Asset | null = await findAssetById(id);
  if (! asset) throw new AppError('error.notFound.asset', 404);
  return asset;
}

/**
 * Create an Asset
 * @param {string} name
 * @return {Promise<Asset>}
 */
export async function createAsset(name: string) {
  const asset: Asset = new AssetDoc({name});
  return asset.save();
}

/**
 * Update an Asset attributes
 * After update, update asset of maps (update)
 * After update, update asset of checkPoints (update)
 * TODO Need transaction
 * @param {Asset} asset
 * @param {string} name
 * @return {Promise<Asset>}
 */
export async function updateAsset(asset: Asset, name: string) {
  const assetUpdated: Asset | null = await AssetDoc.findOneAndUpdate(
      {_id: asset._id},
      {name: name},
      {new: true},
  );

  if (! assetUpdated) throw new AppError('error.notFound.asset', 404);

  await updateAssetOfMaps(asset.maps || [], assetUpdated);
  await updateAssetOfCheckPoints(asset.checkPoints || [], assetUpdated);

  return assetUpdated;
}

/**
 * Delete an Asset if asset includes any maps or checkPoints
 * @param {string} id
 * @return {Promise<{n, deletedCount, ok}>}
 */
export async function deleteAsset(id: string) {
  const asset: Asset = await findAssetByIdWithThrow(id);

  if (asset.maps.length > 0) {
    throw new AppError('error.delete.asset.mapsExists', 400);
  }
  if (asset.checkPoints.length > 0) {
    throw new AppError('error.delete.asset.checkpointsExists', 400);
  }

  // await updateAssetOfMaps(asset.maps || [], undefined);
  // await updateAssetOfCheckPoints(asset.checkPoints || [], undefined);

  return AssetDoc.deleteOne({_id: id});
}

// <editor-fold desc="Map">

/**
 * Add map into assets
 * It pushes new map into asset.maps
 * @param {string} id
 * @param {Map} map
 * @return {Promise<Asset | null>}
 */
export async function addMapIntoAsset(id: string, map: Map) {
  return AssetDoc.findOneAndUpdate(
      {_id: id},
      {$push: {maps: map}},
      {new: true},
  );
}

/**
 * Update map in asset
 * It updates a map in asset.maps
 * @param {string} id
 * @param {Map} map
 * @return {Promise<Asset | null>}
 */
export async function updateMapInAsset(id: string, map: Map) {
  return AssetDoc.findOneAndUpdate(
      {'_id': id, 'maps._id': map._id},
      {'maps.$': map},
      {new: true},
  );
}

/**
 * Remove map from asset
 * It pulls a map from asset.maps
 * @param {string} id
 * @param {Map} map
 * @return {Promise<{n, nModified, ok}>}
 */
export async function removeMapFromAsset(id: string, map: Map) {
  return AssetDoc.updateMany(
      {_id: id},
      {
        $pull: {
          maps: {_id: map._id},
        },
      },
  );
}

// </editor-fold>

// <editor-fold desc="CheckPoint">

/**
 * Add checkPoint into asset
 * It pushes new checkPoint into asset.checkPoints
 * @param {string} id
 * @param {CheckPoint} checkPoint
 * @return {Promise<Asset | null>}
 */
export async function addCheckPointIntoAsset(
    id: string,
    checkPoint: CheckPoint) {
  return AssetDoc.findOneAndUpdate(
      {_id: id},
      {$push: {checkPoints: checkPoint}},
      {new: true},
  );
}

/**
 * Update checkPoint in asset
 * It updates a checkPoint in asset.checkPoints
 * @param {string} id
 * @param {CheckPoint} checkPoint
 * @return {Promise<Asset | null>}
 */
export async function updateCheckPointInAsset(
    id: string,
    checkPoint: CheckPoint) {
  return AssetDoc.findOneAndUpdate(
      {'_id': id, 'checkPoints._id': checkPoint._id},
      {'checkPoints.$': checkPoint},
      {new: true},
  );
}

/**
 * Remove checkPoint from asset
 * It pulls a checkPoint from asset.checkPoints
 * @param {string} id
 * @param {CheckPoint} checkPoint
 * @return {Promise<{n, nModified, ok}>}
 */
export async function removeCheckPointFromAsset(
    id: string,
    checkPoint: CheckPoint) {
  return AssetDoc.updateMany(
      {_id: id},
      {
        $pull: {
          checkPoints: {_id: checkPoint._id},
        },
      },
  );
}

// </editor-fold>
