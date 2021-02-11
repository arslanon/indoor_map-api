
import {Asset} from '../models/asset.model';
import MapDoc, {Map} from '../models/map.model';
import {CheckPoint} from '../models/check-point.model';
import {AppError} from '../common/error';
import imageTileParser from './../shared/image-tile.parser';
import {MapSub} from '../models/_sub.model';
import {
  findAssetById,
  addMapIntoAsset,
  updateMapInAsset,
  removeMapFromAsset,
  updateMapOfCheckPoints,
} from './';

/**
 * Get all Maps
 * @return {Promise<Map[]>}
 */
export async function findMaps() {
  return MapDoc.find()
      .select({
        _id: 1,
        name: 1,
        asset: 1,
      })
      .lean<Map[]>();
}

/**
 * Get all Maps by asset
 * @param {string} assetId
 * @return {Promise<Map[]>}
 */
export async function findMapsByAsset(assetId: string) {
  return MapDoc.find({'asset._id': assetId})
      .select({
        _id: 1,
        name: 1,
        asset: 1,
      })
      .lean<Map[]>();
}

/**
 * Get Map by id
 * @param {string} id
 * @return {Promise<Map | null>}
 */
export async function findMapById(id: string) {
  return MapDoc.findOne({_id: id})
      .select({
        _id: 1,
        name: 1,
        asset: 1,
        path: 1,
        width: 1,
        height: 1,
        maxZoom: 1,
        checkPoints: 1,
      })
      .lean<Map>();
}

/**
 * Get Map by id and asset
 * @param {string} id
 * @param {string} assetId
 * @return {Promise<Map | null>}
 */
export async function findMapByIdAndAssetId(id: string, assetId: string) {
  return MapDoc.findOne({'_id': id, 'asset._id': assetId})
      .select({
        _id: 1,
        name: 1,
        asset: 1,
        path: 1,
        width: 1,
        height: 1,
        maxZoom: 1,
        meterMarkers: 1,
      })
      .lean<Map>();
}

/**
 * Get a Map by id with throw
 * Throw notFound error if map not exists
 * @param {string} id
 * @return {Promise<Map>}
 */
export async function findMapByIdWithThrow(id: string) {
  const map: Map | null = await findMapById(id);
  if (! map) throw new AppError('error.notFound.map', 404);
  return map;
}

/**
 * Get a Map by id and asset with throw
 * Throw notFound error if map not exists
 * @param {string} id
 * @param {string} assetId
 * @return {Promise<Map>}
 */
export async function findMapByIdAndAssetIdWithThrow(
    id: string,
    assetId: string) {
  const map: Map | null = await findMapByIdAndAssetId(id, assetId);
  if (! map) throw new AppError('error.notFound.map', 404);
  return map;
}

/**
 * Create a Map
 * After create, update asset maps (add)
 * TODO Need transaction
 * @param {string} name: string
 * @param {string} filePath: image file path
 * @param {string} assetId: string
 * @return {Promise<Map>}
 */
export async function createMap(
    name: string,
    filePath: string,
    assetId?: string) {
  const asset: Asset | null = assetId ? await findAssetById(assetId) : null;
  const map: Map = new MapDoc({name, asset});
  await map.save();

  if (asset) await addMapIntoAsset(asset._id, map);

  return await updateMap(
      map,
      name,
      assetId,
      filePath,
  );
}

/**
 * Update a Map
 * After update, update maps of asset (remove, add or update)
 * After update, update map of checkPoints (update)
 * TODO If updated asset is not match checkPoints.asset in map
 * TODO Need transaction
 * @param {Map} map
 * @param {string} name
 * @param {string} assetId
 * @param {string | undefined} imagePath?: image file path
 * @return {Promise<Map>}
 */
export async function updateMap(
    map: Map,
    name: string,
    assetId?: string,
    imagePath?: string) {
  const asset: Asset | null = assetId ? await findAssetById(assetId) : null;

  // TODO Old image path needs to be deleted if exists
  const {path, width, height, maxZoom} = imagePath ?
    await imageTileParser(imagePath, map._id) : map;

  const mapUpdated: Map | null = await MapDoc.findOneAndUpdate(
      {_id: map._id},
      {
        name,
        asset: asset || undefined,
        path,
        width,
        height,
        maxZoom,
      },
      {new: true}
  ).lean<Map>();

  if (! mapUpdated) {
    throw new AppError('error.notFound.map', 404);
  }

  if (map.asset) {
    if (mapUpdated.asset) {
      if (mapUpdated.asset._id.equals(map.asset._id)) {
        await updateMapInAsset(mapUpdated.asset._id, mapUpdated);
      } else {
        await removeMapFromAsset(map.asset._id, map);
        await addMapIntoAsset(mapUpdated.asset._id, mapUpdated);
      }
    } else {
      await removeMapFromAsset(map.asset._id, map);
    }
  } else if (mapUpdated.asset) {
    await addMapIntoAsset(mapUpdated.asset._id, mapUpdated);
  }

  await updateMapOfCheckPoints(mapUpdated.checkPoints || [], mapUpdated);

  return mapUpdated;
}

/**
 * Delete a Map if map includes any checkPoints
 * Before delete, update maps of asset (remove)
 * TODO Need transaction
 * @param {string} id
 * @return {Promise<{n, deletedCount, ok}>}
 */
export async function deleteMap(id: string) {
  const map: Map = await findMapByIdWithThrow(id);

  if (map.checkPoints.length > 0) {
    throw new AppError('error.delete.map.checkpointsExists', 400);
  }

  // TODO Image path needs to be deleted if exists

  if (map.asset) await removeMapFromAsset(map.asset._id, map);

  // await updateMapOfCheckPoints(map.checkPoints || [], undefined);

  return MapDoc.deleteOne({_id: id});
}

// <editor-fold desc="Asset">

/**
 * Update asset of maps
 * @param {MapSub[]} maps
 * @param {Asset | undefined} asset?
 * @return {Promise<n, nModified, ok>}
 */
export async function updateAssetOfMaps(maps: MapSub[], asset?: Asset) {
  return MapDoc.updateMany(
      {_id: {$in: maps.map((m) => m._id)}},
      {asset: asset},
  );
}

// </editor-fold>

// <editor-fold desc="CheckPoint">

/**
 * Add checkPoint into map
 * => It pushes new checkPoint into map.checkPoints
 * @param {string} id
 * @param {CheckPoint} checkPoint
 * @return {Promise<Map | null>}
 */
export async function addCheckPointIntoMap(
    id: string,
    checkPoint: CheckPoint) {
  return MapDoc.findOneAndUpdate(
      {_id: id},
      {$push: {checkPoints: checkPoint}},
      {new: true},
  ).lean<Map>();
}

/**
 * Update checkPoint in map
 * => It updates a checkPoint in map.checkPoints
 * @param {string} id
 * @param {CheckPoint} checkPoint
 * @return {Promise<Map | null>}
 */
export async function updateCheckPointInMap(
    id: string,
    checkPoint: CheckPoint) {
  return MapDoc.findOneAndUpdate(
      {'_id': id, 'checkPoints._id': checkPoint._id},
      {'checkPoints.$': checkPoint},
      {new: true},
  ).lean<Map>();
}

/**
 * Remove checkPoint from map
 * => It pulls a checkPoint from map.checkPoints
 * @param {string} id
 * @param {CheckPoint} checkPoint
 * @return {Promise<{n, nModified, ok}>}
 */
export async function removeCheckPointFromMap(
    id: string,
    checkPoint: CheckPoint) {
  return MapDoc.updateMany(
      {_id: id},
      {
        $pull: {
          checkPoints: {_id: checkPoint._id},
        },
      },
  );
}

// </editor-fold>
