/* eslint-disable max-len */
import setupTestDatabase from '../shared/db-test-setup';
import MapDoc, {Map} from '../models/map.model';
import CheckPointDoc, {CheckPoint} from '../models/check-point.model';
import {
  findCheckPoints,
  findCheckPointsByMap,
  findCheckPointById,
  findCheckPointByIdWithThrow,
  findCheckPointByMacAddress,
  existsCheckPointByMacAddress,
  createCheckPoint,
  updateCheckPoint,
  setCheckPointMap,
  unsetCheckPointMap,
  updateCheckPointPosition,
  deleteCheckPoint,
  upsertCheckPointWithCSV,
} from '../services';
import mongoose from 'mongoose';
import fs from 'fs';

describe('CheckPoint CRUD Service', () => {
  setupTestDatabase('indoorMap-testDb-checkPoint', ['checkPoint']);

  jest.setTimeout(50000);

  // <editor-fold desc="FIND">

  it('Find checkPoints', async (done) => {
    const checkPoints: CheckPoint[] = await findCheckPoints();

    expect(checkPoints).toBeTruthy();
    expect(checkPoints).toHaveLength(3);

    done();
  });

  it('Find checkPoints by a map', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const checkPoints: CheckPoint[] = await findCheckPointsByMap(map!._id);

    expect(checkPoints).toBeTruthy();
    expect(checkPoints).toHaveLength(1);

    done();
  });

  it('Find a checkPoint by id', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const checkPointFound: CheckPoint | null = await findCheckPointById(checkPoint!._id);

    expect(checkPointFound).toBeTruthy();
    expect(checkPointFound!._id).toBeTruthy();
    expect(checkPointFound!.name).toStrictEqual(checkPoint!.name);
    expect(checkPointFound!.macAddress).toBeTruthy();
    expect(checkPointFound!.map).toBeTruthy();
    expect(checkPointFound!.x).not.toBeTruthy();
    expect(checkPointFound!.y).not.toBeTruthy();

    done();
  });

  it('Find a checkPoint by id throws', async (done) => {
    await expect(findCheckPointByIdWithThrow(new mongoose.Types.ObjectId().toHexString()))
        .rejects.toThrow();
    await expect(findCheckPointByIdWithThrow(new mongoose.Types.ObjectId().toHexString()))
        .rejects.toThrowError('error.notFound.checkPoint');

    done();
  });

  it('Find a checkPoint by macAddress', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const checkPointFound: CheckPoint | null = await findCheckPointByMacAddress(checkPoint!.macAddress);

    expect(checkPointFound).toBeTruthy();
    expect(checkPointFound!._id).toBeTruthy();
    expect(checkPointFound!.name).toStrictEqual(checkPoint!.name);
    expect(checkPointFound!.macAddress).toBeTruthy();
    expect(checkPointFound!.macAddress).toStrictEqual(checkPoint!.macAddress);
    expect(checkPointFound!.map).toBeTruthy();
    expect(checkPointFound!.x).not.toBeTruthy();
    expect(checkPointFound!.y).not.toBeTruthy();

    done();
  });

  it('Exists a checkPoint by macAddress', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const exists: boolean = await existsCheckPointByMacAddress(checkPoint!.macAddress);

    expect(exists).toStrictEqual(true);

    done();
  });

  // </editor-fold>

  // <editor-fold desc="CREATE">

  // noinspection DuplicatedCode
  it('Create a checkPoint', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const checkPoint: CheckPoint = await createCheckPoint(
        'TestCheckPoint1',
        '112233445566'
    );

    expect(checkPoint).toBeTruthy();
    expect(checkPoint._id).toBeTruthy();
    expect(checkPoint.name).toStrictEqual('TestCheckPoint1');
    expect(checkPoint.macAddress).toStrictEqual('112233445566');

    done();
  });

  // noinspection DuplicatedCode
  it('Create checkPoints with csv', async (done) => {
    fs.copyFileSync(`files/checkpoints.csv`, `tmp/uploads/checkpoints.csv`);

    const checkPoints: CheckPoint[] = await upsertCheckPointWithCSV(
        'tmp/uploads/checkpoints.csv'
    );

    expect(checkPoints).toBeTruthy();
    expect(checkPoints).toHaveLength(3);

    const [first, second, third] = checkPoints;
    expect(first.name).toEqual('CSV CheckPoint 1');
    expect(first.macAddress).toEqual('70B3D580A010062F');
    expect(second.name).toEqual('CSV CheckPoint 2');
    expect(second.macAddress).toEqual('70B3D580A010062C');
    expect(third.name).toEqual('CSV CheckPoint 3');
    expect(third.macAddress).toEqual('50B3D580A010062C');

    done();
  });

  // </editor-fold>

  // <editor-fold desc="UPDATE">

  // noinspection DuplicatedCode
  it('Update a checkPoint', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const checkPointUpdated: CheckPoint = await updateCheckPoint(
            checkPoint!._id,
            'TestCheckPoint1',
            '665544332211',
    );

    expect(checkPointUpdated).toBeTruthy();
    expect(checkPointUpdated._id).toBeTruthy();
    expect(checkPointUpdated.name).toStrictEqual('TestCheckPoint1');
    expect(checkPointUpdated.macAddress).toStrictEqual('665544332211');
    expect(checkPointUpdated.map).toBeTruthy();

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints).toHaveLength(1);
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPoint!.name)).toHaveLength(0);
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPointUpdated!.name)).toHaveLength(1);

    done();
  });

  // noinspection DuplicatedCode
  it('Update checkPoints with csv', async (done) => {
    const checkPoint: CheckPoint = await createCheckPoint(
        'TestCheckPoint1',
        '70B3D580A010062F'
    );

    expect(checkPoint).toBeTruthy();
    expect(checkPoint._id).toBeTruthy();
    expect(checkPoint.name).toStrictEqual('TestCheckPoint1');
    expect(checkPoint.macAddress).toStrictEqual('70B3D580A010062F');
    expect(checkPoint.map).not.toBeTruthy();

    fs.copyFileSync(`files/checkpoints.csv`, `tmp/uploads/checkpoints.csv`);

    const checkPoints: CheckPoint[] = await upsertCheckPointWithCSV(
        'tmp/uploads/checkpoints.csv'
    );

    expect(checkPoints).toBeTruthy();
    expect(checkPoints).toHaveLength(3);

    const checkPointFound: CheckPoint | null = await findCheckPointByMacAddress(checkPoint.macAddress);

    expect(checkPointFound).toBeTruthy();
    expect(checkPointFound!._id).toBeTruthy();
    expect(checkPointFound!.name).not.toStrictEqual('TestCheckPoint1');
    expect(checkPointFound!.name).toStrictEqual('CSV CheckPoint 1');
    expect(checkPointFound!.macAddress).toBeTruthy();
    expect(checkPointFound!.macAddress).toStrictEqual(checkPoint!.macAddress);

    done();
  });

  // noinspection DuplicatedCode
  it('Update a checkPoint position', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const checkPointPositioned: CheckPoint | null = await updateCheckPointPosition(
      checkPoint!._id,
      1000,
      900,
    );

    expect(checkPointPositioned).toBeTruthy();
    expect(checkPointPositioned!._id).toBeTruthy();
    expect(checkPointPositioned!.name).toBeTruthy();
    expect(checkPointPositioned!.macAddress).toBeTruthy();
    expect(checkPointPositioned!.map).toBeTruthy();
    expect(checkPointPositioned!.x).toStrictEqual(1000);
    expect(checkPointPositioned!.y).toStrictEqual(900);

    done();
  });

  // noinspection DuplicatedCode
  it('Set a checkPoint map', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(map).toBeTruthy();

    const checkPointUpdated: CheckPoint = await setCheckPointMap(
            checkPoint!._id,
            map!._id,
            520,
            480
    );

    expect(checkPointUpdated).toBeTruthy();
    expect(checkPointUpdated._id).toBeTruthy();
    expect(checkPointUpdated.name).toBeTruthy();
    expect(checkPointUpdated.macAddress).toBeTruthy();
    expect(checkPointUpdated.x).toStrictEqual(520);
    expect(checkPointUpdated.y).toStrictEqual(480);
    expect(checkPointUpdated.map!._id).toStrictEqual(map!._id);
    expect(checkPointUpdated.map!.name).toStrictEqual(map!.name);

    const mapOld: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapOld).toBeTruthy();
    expect(mapOld!.checkPoints).toHaveLength(0);
    expect(mapOld!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(0);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints).toHaveLength(2);
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(1);

    done();
  });

  // noinspection DuplicatedCode
  it('Unset a checkPoint map', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const checkPointUpdated: CheckPoint = await unsetCheckPointMap(
      checkPoint!._id
    );

    expect(checkPointUpdated).toBeTruthy();
    expect(checkPointUpdated._id).toBeTruthy();
    expect(checkPointUpdated.name).toBeTruthy();
    expect(checkPointUpdated.macAddress).toBeTruthy();
    expect(checkPointUpdated.map).not.toBeTruthy();
    expect(checkPointUpdated.x).not.toBeTruthy();
    expect(checkPointUpdated.y).not.toBeTruthy();

    const mapOld: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapOld).toBeTruthy();
    expect(mapOld!.checkPoints).toHaveLength(0);
    expect(mapOld!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(0);

    done();
  });

  // </editor-fold>

  // <editor-fold desc="DELETE">

  it('Delete a checkPoint', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();
    expect(map!.checkPoints.filter((c) => c.name === checkPoint!.name)).toHaveLength(1);

    const res: any = await deleteCheckPoint(checkPoint!._id);
    expect(res).toBeTruthy();
    expect(res.deletedCount).toStrictEqual(1);

    const checkPointDeleted: CheckPoint | null = await findCheckPointById(checkPoint!._id);
    expect(checkPointDeleted).not.toBeTruthy();

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPoint!.name)).toHaveLength(0);

    done();
  });

  // </editor-fold>
});
