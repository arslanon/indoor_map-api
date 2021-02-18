import {Map} from '../models/map.model';
import CheckPointDoc, {CheckPoint} from '../models/check-point.model';
import {
  findMapByIdWithThrow,
  addCheckPointIntoMap,
  updateCheckPointInMap,
  removeCheckPointFromMap
} from './';
import {AppError} from '../common/error';
import {CheckPointSub} from '../models/_sub.model';
import csvParser from '../shared/csv.parser';

/**
 * Get all CheckPoints
 * @return {Promise<CheckPoint[]>}
 */
export async function findCheckPoints() {
  return CheckPointDoc.find()
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        map: 1,
        x: 1,
        y: 1,
      })
      .lean<CheckPoint[]>();
}

/**
 * Get all CheckPoints by map
 * @param {string} mapId
 * @return {Promise<CheckPoint[]>}
 */
export async function findCheckPointsByMap(
    mapId: string) {
  return CheckPointDoc.find({'map._id': mapId})
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        x: 1,
        y: 1,
      })
      .lean<CheckPoint[]>();
}

/**
 * Get CheckPoint by id
 * @param {string} id
 * @return {Promise<CheckPoint | null>}
 */
export async function findCheckPointById(
    id: string) {
  return CheckPointDoc.findOne({_id: id})
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        map: 1,
        x: 1,
        y: 1,
      })
      .lean<CheckPoint>();
}

/**
 * Get a CheckPoint by id with throw
 * Throw notFound error if checkPoint not exists
 * @param {string} id
 * @return {Promise<CheckPoint>}
 */
export async function findCheckPointByIdWithThrow(
    id: string) {
  const checkPoint = await findCheckPointById(id);
  if (! checkPoint) throw new AppError('error.notFound.checkPoint', 404, true);
  return checkPoint;
}

/**
 * Get CheckPoint by mac address
 * @param {string} macAddress
 * @return {Promise<CheckPoint | null>}
 */
export async function findCheckPointByMacAddress(
    macAddress: string) {
  return CheckPointDoc.findOne({macAddress})
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        map: 1,
        x: 1,
        y: 1,
      })
      .lean<CheckPoint>();
}

/**
 * Exists CheckPoint by mac address
 * @return {Promise<boolean>}
 * @param {string} macAddress
 */
export async function existsCheckPointByMacAddress(
    macAddress: string) {
  return CheckPointDoc.exists({macAddress});
}

/**
 * Create a CheckPoint
 * After create, update map checkPoints (add)
 * TODO Need transaction
 * @param {string} name
 * @param {string} macAddress
 * @return {Promise<CheckPoint>}
 */
export async function createCheckPoint(
    name: string,
    macAddress: string) {
  const checkPoint: CheckPoint = new CheckPointDoc(
      {name, macAddress},
  );
  return await checkPoint.save();
}

/**
 * Update a CheckPoint
 * After update, update checkPoints of map (update)
 * TODO Need transaction
 * @param {string} id
 * @param {string} name
 * @param {string} macAddress
 * @return {Promise<CheckPoint>}
 */
export async function updateCheckPoint(
    id: string,
    name: string,
    macAddress: string) {
  const checkPoint: CheckPoint = await findCheckPointByIdWithThrow(id);

  const checkPointUpdated: CheckPoint | null =
    await CheckPointDoc.findOneAndUpdate(
        {_id: id},
        {
          name,
          macAddress,
        },
        {new: true}
    ).lean<CheckPoint>();

  if (! checkPointUpdated) {
    throw new AppError('error.notFound.checkPoint', 404, true);
  }

  if (checkPoint.map) {
    await updateCheckPointInMap(
        checkPoint.map._id, checkPointUpdated,
    );
  }

  return checkPointUpdated;
}

/**
 * Create/Update CheckPoints via csv
 * TODO Need transaction
 * @param {string} path
 * @return {Promise<CheckPoint[]>}
 */
export async function upsertCheckPointWithCSV(
    path: string): Promise<CheckPoint[]> {
  const checkPoints = await csvParser<CheckPoint>(path);

  const returnedCheckPoints: CheckPoint[] = [];
  const newCheckPoints: CheckPoint[] = [];

  for (const checkPoint of checkPoints) {
    const checkPointExisted =
      await findCheckPointByMacAddress(checkPoint.macAddress);

    if (checkPointExisted) {
      const checkPointUpdated = await updateCheckPoint(
          checkPointExisted._id,
          checkPoint.name,
          checkPoint.macAddress
      );

      if (checkPointUpdated) returnedCheckPoints.push(checkPointUpdated);
    } else {
      newCheckPoints.push(checkPoint);
    }
  }

  for (const checkPoint of newCheckPoints) {
    const checkPointNew = await createCheckPoint(
        checkPoint.name,
        checkPoint.macAddress
    );

    returnedCheckPoints.push(checkPointNew);
  }

  return returnedCheckPoints;
}

/**
 * Update a CheckPoint position
 * @param {string} id
 * @param {number} x
 * @param {number} y
 * @return {Promise<CheckPoint | null>}
 */
export async function updateCheckPointPosition(
    id: string,
    x: number,
    y: number) {
  return CheckPointDoc.findOneAndUpdate(
      {_id: id},
      {
        x,
        y,
      },
      {new: true}
  ).lean<CheckPoint>();
}

/**
 * Set a CheckPoint map and position
 * After update, update checkPoints of map (remove, add or update)
 * TODO Need transaction
 * @param {string} id
 * @param {string} mapId
 * @param {number} x
 * @param {number} y
 * @return {Promise<CheckPoint>}
 */
export async function setCheckPointMap(
    id: string,
    mapId: string,
    x: number,
    y: number) {
  const checkPoint: CheckPoint = await findCheckPointByIdWithThrow(id);
  const map: Map = await findMapByIdWithThrow(mapId);

  if (! (map && x && y)) {
    throw new AppError('error.missing_parameter.chokePoint_set_map', 401, true);
  }

  const checkPointUpdated: CheckPoint | null = await CheckPointDoc.findOneAndUpdate(
      {_id: id},
      {
        map,
        x,
        y,
      },
      {new: true}
  ).lean<CheckPoint>();

  if (! checkPointUpdated) {
    throw new AppError('error.notFound.checkPoint', 404, true);
  }

  if (checkPoint.map) {
    if (checkPointUpdated.map) {
      if (checkPointUpdated.map._id.equals(checkPoint.map._id)) {
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
 * Unset a CheckPoint map and position (remove map, x and y attributes)
 * After update, update checkPoints of map (remove)
 * TODO Need transaction
 * @param {string} id
 * @return {Promise<CheckPoint>}
 */
export async function unsetCheckPointMap(
    id: string) {
  const checkPoint: CheckPoint = await findCheckPointByIdWithThrow(id);

  const checkPointUpdated: CheckPoint | null = await CheckPointDoc.findOneAndUpdate(
      {_id: id},
      {
        map: undefined,
        x: undefined,
        y: undefined,
      },
      {new: true}
  ).lean<CheckPoint>();

  if (! checkPointUpdated) {
    throw new AppError('error.notFound.checkPoint', 404, true);
  }

  if (checkPoint.map) {
    await removeCheckPointFromMap(
        checkPoint.map._id, checkPoint,
    );
  }

  return checkPointUpdated;
}

/**
 * Delete a CheckPoint
 * Before delete, update checkPoints of map (remove)
 * TODO Need transaction
 * @param {string} id
 * @return {Promise<{n, deletedCount, ok}>}
 */
export async function deleteCheckPoint(
    id: string) {
  const checkPoint: CheckPoint = await findCheckPointByIdWithThrow(id);

  if (checkPoint.map) {
    await removeCheckPointFromMap(checkPoint.map._id, checkPoint);
  }

  return CheckPointDoc.deleteOne({_id: id});
}

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
