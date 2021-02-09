import {Asset} from '../models/asset.model';
import {Map} from '../models/map.model';
import CheckPointDoc, {CheckPoint} from '../models/check-point.model';
import {
  findAssetById,
  addCheckPointIntoAsset,
  updateCheckPointInAsset,
  removeCheckPointFromAsset,
  findMapByIdAndAssetId,
  addCheckPointIntoMap,
  updateCheckPointInMap,
  removeCheckPointFromMap,
} from './';

import {AppError} from '../common/error';
import {CheckPointSub} from '../models/_sub.model';

import csvParser from '../shared/csv.parser'

/**
 * Get all CheckPoints
 * @param {string} mapId
 * @return {Promise<CheckPoint[]>}
 */
export async function findCheckPointsByMap(mapId: string) {
  return CheckPointDoc.find({'map._id': mapId}).select({
    _id: 1,
    name: 1,
    macAddress: 1,
    x: 1,
    y: 1,
  });
}

/**
 * Get CheckPoint by id
 * @param {string} id
 * @return {Promise<CheckPoint | null>}
 */
export async function findCheckPointById(id: string) {
  return CheckPointDoc.findOne({_id: id})
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        asset: 1,
        map: 1,
        x: 1,
        y: 1,
      });
}

/**
 * Get CheckPoint by id
 * @return {Promise<CheckPoint | null>}
 * @param macAddress
 */
export async function findCheckPointByMacAddress(macAddress: string) {
  return CheckPointDoc.findOne({macAddress: macAddress})
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        asset: 1,
        map: 1,
      });
}

/**
 * Get a CheckPoint by id with throw
 * Throw notFound error if checkPoint not exists
 * @param {string} id
 * @return {Promise<CheckPoint>}
 */
export async function findCheckPointByIdWithThrow(id: string) {
  const checkPoint = await findCheckPointById(id);
  if (! checkPoint) throw new AppError('error.notFound.checkPoint', 404);
  return checkPoint;
}

/**
 * Create a CheckPoint
 * After create, update asset checkPoints (add) and map checkPoints (add)
 * TODO Need transaction
 * @param {string} name
 * @param {string} macAddress
 * @param {string} assetId?
 * @param {string} mapId?
 * @return {Promise<CheckPoint>}
 */
export async function createCheckPoint(
    name: string,
    macAddress: string,
    assetId?: string,
    mapId?: string) {
  const asset = assetId ? await findAssetById(assetId) : null;
  const map = mapId ? await findMapByIdAndAssetId(mapId, asset?._id) : null;

  const checkPoint: CheckPoint = new CheckPointDoc(
      {name, macAddress, asset, map},
  );
  await checkPoint.save();

  if (asset) await addCheckPointIntoAsset(asset._id, checkPoint);
  if (map) await addCheckPointIntoMap(map._id, checkPoint);
  return checkPoint;
}

export async function createCheckPointWithCSV(
    path: string,
    assetId?: string,
    mapId?: string,
): Promise<CheckPoint[]> {
  const asset = assetId ? await findAssetById(assetId): null;
  const map = mapId ? await findMapByIdAndAssetId(mapId, asset?._id) : null;
  const checkPoints = await csvParser<CheckPoint>(path)
  let updateDocuments: CheckPoint[] = [];
  let insertDocuments: CheckPoint[] = [];

  for (const cp of checkPoints) {
      const oldCheckPoint = await findCheckPointByMacAddress(cp.macAddress);

      if(oldCheckPoint) {
        // @ts-ignore
        const updatedCheckPoint = await CheckPointDoc.findOneAndUpdate(
          {macAddress: oldCheckPoint.macAddress},
          {
            name: cp.name,
            'asset': asset,
            'map': map
          },
          {new: true}
        )
        // @ts-ignore
        updateDocuments.push(updatedCheckPoint)
      } else {
        Object.assign(cp, {map: map, asset: asset});
        insertDocuments.push(cp)
      }
  }

  if(insertDocuments.length) {
    // @ts-ignore
    return new Promise(async (resolve, reject) => {
      CheckPointDoc.insertMany(insertDocuments, {
        ordered: false,
      }, async (error, docs) => {
        if (error) {
          reject(error);
        } else {
          if (asset) {
            // @ts-ignore
            for (const cp of docs) {
              if (asset) await addCheckPointIntoAsset(asset._id, cp);
              if (map) await addCheckPointIntoMap(map._id, cp);
            }
          }
          resolve([...docs, ...updateDocuments]);
        }
      })
    }).catch((e) => {
      throw new AppError(e, 404, true)
    })
  } else {
    return updateDocuments;
  }
}

/**
 * Update a CheckPoint
 * After update, update checkPoints of asset (remove, add or update)
 * After update, update checkPoints of map (remove, add or update)
 * If map is changed, x and y positions are set as undefined
 * TODO Need transaction
 * @param {string} id
 * @param {string} name
 * @param {string} macAddress
 * @param {string} assetId?
 * @param {string} mapId?
 * @return {Promise<CheckPoint>}
 */
export async function updateCheckPoint(
    id: string,
    name: string,
    macAddress: string,
    assetId?: string, mapId?: string) {
  const checkPoint: CheckPoint = await findCheckPointByIdWithThrow(id);
  const asset: Asset | null = assetId ? await findAssetById(assetId) : null;
  const map: Map | null = mapId ?
    await findMapByIdAndAssetId(mapId, asset?._id) : null;

  const position = {
    x: checkPoint.x,
    y: checkPoint.y,
  };

  if (map && ! checkPoint.map?.equals(map)) {
    position.x = undefined;
    position.y = undefined;
  }

  const checkPointUpdated: CheckPoint | null =
    await CheckPointDoc.findOneAndUpdate({_id: id}, {
      name,
      macAddress,
      asset: asset || undefined,
      map: map || undefined,
      x: position.x,
      y: position.y,
    }, {new: true});

  if (! checkPointUpdated) {
    throw new AppError('error.notFound.checkPoint', 404);
  }

  if (checkPoint.asset) {
    if (checkPointUpdated.asset) {
      if (checkPointUpdated.asset.equals(checkPoint.asset)) {
        await updateCheckPointInAsset(
            checkPointUpdated.asset._id, checkPointUpdated,
        );
      } else {
        await removeCheckPointFromAsset(
            checkPoint.asset._id, checkPoint,
        );
        await addCheckPointIntoAsset(
            checkPointUpdated.asset._id, checkPointUpdated,
        );
      }
    } else {
      await removeCheckPointFromAsset(
          checkPoint.asset._id, checkPoint,
      );
    }
  } else if (checkPointUpdated.asset) {
    await addCheckPointIntoAsset(
        checkPointUpdated.asset._id, checkPointUpdated,
    );
  }

  if (checkPoint.map) {
    if (checkPointUpdated.map) {
      if (checkPointUpdated.map.equals(checkPoint.map)) {
        await updateCheckPointInMap(
            checkPointUpdated.map._id, checkPointUpdated,
        );
      } else {
        await removeCheckPointFromMap(
            checkPoint.map._id, checkPoint,
        );
        await addCheckPointIntoMap(
            checkPointUpdated.map._id, checkPointUpdated,
        );
      }
    } else {
      await removeCheckPointFromMap(
          checkPoint.map._id, checkPoint,
      );
    }
  } else if (checkPointUpdated.map) {
    await addCheckPointIntoMap(
        checkPointUpdated.map._id, checkPointUpdated,
    );
  }

  return checkPointUpdated;
}

/**
 * Update a CheckPoint position only
 * @param {string} id
 * @param {number} x
 * @param {number} y
 * @return {Promise<CheckPoint | null>}
 */
export async function updateCheckPointPosition(
    id: string,
    x: number,
    y: number) {
  return CheckPointDoc.findOneAndUpdate({_id: id}, {
    x,
    y,
  }, {new: true});
}

/**
 * Delete a CheckPoint
 * Before delete, update checkPoints of asset (remove)
 * Before delete, update checkPoints of map (remove)
 * TODO Need transaction
 * @param {string} id
 * @return {Promise<{n, deletedCount, ok}>}
 */
export async function deleteCheckPoint(id: string) {
  const checkPoint: CheckPoint = await findCheckPointByIdWithThrow(id);

  if (checkPoint.asset) {
    await removeCheckPointFromAsset(checkPoint.asset._id, checkPoint);
  }
  if (checkPoint.map) {
    await removeCheckPointFromMap(checkPoint.map._id, checkPoint);
  }

  return CheckPointDoc.deleteOne({_id: id});
}

// <editor-fold desc="Asset">

/**
 * Update asset of checkPoints
 * @param {CheckPointSub[]} checkPoints
 * @param {Asset | undefined} asset?
 * @return {Promise<{n, nModified, ok}>}
 */
export async function updateAssetOfCheckPoints(
    checkPoints: CheckPointSub[],
    asset?: Asset) {
  return CheckPointDoc.updateMany(
      {_id: {$in: checkPoints.map((c) => c._id)}},
      {asset: asset},
  );
}

// </editor-fold>

// <editor-fold desc="Map">

/**
 * Update map of checkPoints
 * @param {CheckPointSub[]} checkPoints
 * @param {Map | undefined} map?
 * @return {Promise<{n, nModified, ok}>}
 */
export async function updateMapOfCheckPoints(
    checkPoints: CheckPointSub[],
    map?: Map) {
  return CheckPointDoc.updateMany(
      {_id: {$in: checkPoints.map((c) => c._id)}},
      {map: map},
  );
}

// </editor-fold>
