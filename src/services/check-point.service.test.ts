/* eslint-disable max-len */
import setupTestDatabase from '../shared/db-test-setup';
import AssetDoc, {Asset} from '../models/asset.model';
import MapDoc, {Map} from '../models/map.model';
import CheckPointDoc, {CheckPoint} from '../models/check-point.model';
import {
  findCheckPointsByMap,
  findCheckPointById,
  createCheckPoint,
  updateCheckPoint,
  updateCheckPointPosition,
  deleteCheckPoint,
} from './check-point.service';

describe('CheckPoint CRUD Service', () => {
  setupTestDatabase('indoorMap-testDb-checkPoint', ['checkPoint']);

  jest.setTimeout(50000);

  // <editor-fold desc="FIND">

  it('Find checkPoints that belong to a map', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const checkPoints: CheckPoint[] = await findCheckPointsByMap(map!._id);

    expect(checkPoints).toBeTruthy();
    expect(checkPoints).toHaveLength(1);

    done();
  });

  it('Find a checkPoint', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const checkPointFound: CheckPoint | null = await findCheckPointById(checkPoint!._id);

    expect(checkPointFound).toBeTruthy();
    expect(checkPointFound!._id).toBeTruthy();
    expect(checkPointFound!.name).toStrictEqual('CheckPoint1');
    expect(checkPointFound!.macAddress).toBeTruthy();
    expect(checkPointFound!.asset).toBeTruthy();
    expect(checkPointFound!.asset!.name).toStrictEqual('Asset1');
    expect(checkPointFound!.map).toBeTruthy();
    expect(checkPointFound!.map!.name).toStrictEqual('Map1');
    expect(checkPointFound!.x).not.toBeTruthy();
    expect(checkPointFound!.y).not.toBeTruthy();

    done();
  });

  // </editor-fold>

  // <editor-fold desc="CREATE">

  // noinspection DuplicatedCode
  it('Create a checkPoint - Send name, macAddress, asset and map', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const checkPoint: CheckPoint = await createCheckPoint(
        'TestCheckPoint1',
        '111111',
            asset!._id,
            map!._id,
    );

    expect(checkPoint).toBeTruthy();
    expect(checkPoint._id).toBeTruthy();
    expect(checkPoint.name).toStrictEqual('TestCheckPoint1');
    expect(checkPoint.macAddress).toStrictEqual('111111');
    expect(checkPoint.asset).toBeTruthy();
    expect(checkPoint.asset!.name).toStrictEqual(asset!.name);
    expect(checkPoint.map).toBeTruthy();
    expect(checkPoint.map!.name).toStrictEqual(map!.name);

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.checkPoints.filter((c) => c.name === checkPoint.name)).toHaveLength(1);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPoint.name)).toHaveLength(1);

    done();
  });

  // noinspection DuplicatedCode
  it('Create a checkPoint - Send name, macAddress and asset', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const checkPoint: CheckPoint = await createCheckPoint(
        'TestCheckPoint1',
        '111111',
            asset!._id,
    );

    expect(checkPoint).toBeTruthy();
    expect(checkPoint._id).toBeTruthy();
    expect(checkPoint.name).toStrictEqual('TestCheckPoint1');
    expect(checkPoint.macAddress).toStrictEqual('111111');
    expect(checkPoint.asset).toBeTruthy();
    expect(checkPoint.asset!.name).toStrictEqual(asset!.name);
    expect(checkPoint.map).not.toBeTruthy();

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.checkPoints.filter((c) => c.name === checkPoint.name)).toHaveLength(1);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPoint.name)).toHaveLength(0);

    done();
  });

  // noinspection DuplicatedCode
  it('Create a checkPoint - Send name, macAddress and map', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const checkPoint: CheckPoint = await createCheckPoint(
        'TestCheckPoint1',
        '111111',
        undefined,
            map!._id,
    );

    expect(checkPoint).toBeTruthy();
    expect(checkPoint._id).toBeTruthy();
    expect(checkPoint.name).toStrictEqual('TestCheckPoint1');
    expect(checkPoint.macAddress).toStrictEqual('111111');
    expect(checkPoint.asset).not.toBeTruthy();
    expect(checkPoint.map).not.toBeTruthy();

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.checkPoints.filter((c) => c.name === checkPoint.name)).toHaveLength(0);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPoint.name)).toHaveLength(0);

    done();
  });

  // noinspection DuplicatedCode
  it('Create a checkPoint - Send name and macAddress', async (done) => {
    const checkPoint: CheckPoint = await createCheckPoint(
        'TestCheckPoint1',
        '111111',
    );

    expect(checkPoint).toBeTruthy();
    expect(checkPoint._id).toBeTruthy();
    expect(checkPoint.name).toStrictEqual('TestCheckPoint1');
    expect(checkPoint.macAddress).toStrictEqual('111111');
    expect(checkPoint.asset).not.toBeTruthy();
    expect(checkPoint.map).not.toBeTruthy();

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.checkPoints.filter((c) => c.name === checkPoint.name)).toHaveLength(0);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPoint.name)).toHaveLength(0);

    done();
  });

  // noinspection DuplicatedCode
  it('Create a checkPoint - Send name, macAddress, asset1 and map2 (map2 does not belong asset1)', async (done) => {
    const asset1: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset1).toBeTruthy();

    const map1: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map1).toBeTruthy();

    const map2: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(map2).toBeTruthy();

    const checkPoint: CheckPoint = await createCheckPoint(
        'TestCheckPoint1',
        '111111',
            asset1!._id,
            map2!._id,
    );

    expect(checkPoint).toBeTruthy();
    expect(checkPoint._id).toBeTruthy();
    expect(checkPoint.name).toStrictEqual('TestCheckPoint1');
    expect(checkPoint.macAddress).toStrictEqual('111111');
    expect(checkPoint.asset).toBeTruthy();
    expect(checkPoint.asset!.name).toStrictEqual(asset1!.name);
    expect(checkPoint.map).not.toBeTruthy();

    const asset1Updated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset1Updated).toBeTruthy();
    expect(asset1Updated!.checkPoints.filter((c) => c.name === checkPoint.name)).toHaveLength(1);

    const map1Updated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map1Updated).toBeTruthy();
    expect(map1Updated!.checkPoints.filter((c) => c.name === checkPoint.name)).toHaveLength(0);

    const map2Updated: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(map2Updated).toBeTruthy();
    expect(map2Updated!.checkPoints.filter((c) => c.name === checkPoint.name)).toHaveLength(0);

    done();
  });

  // </editor-fold>

  // <editor-fold desc="UPDATE">

  // noinspection DuplicatedCode
  it('Update a checkPoint - Send name and macAddress', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const checkPointUpdated: CheckPoint = await updateCheckPoint(
            checkPoint!._id,
            'TestCheckPoint1',
            '111111',
    );

    expect(checkPointUpdated).toBeTruthy();
    expect(checkPointUpdated._id).toBeTruthy();
    expect(checkPointUpdated.name).toStrictEqual('TestCheckPoint1');
    expect(checkPointUpdated.macAddress).toStrictEqual('111111');
    expect(checkPointUpdated.asset).not.toBeTruthy();
    expect(checkPointUpdated.map).not.toBeTruthy();

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.checkPoints).toHaveLength(0);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints).toHaveLength(0);

    done();
  });

  // noinspection DuplicatedCode
  it('Update a checkPoint - Send name, macAddress, asset and map', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const checkPointUpdated: CheckPoint = await updateCheckPoint(
            checkPoint!._id,
            'TestCheckPoint1',
            '111111',
            asset!._id,
            map!._id,
    );

    expect(checkPointUpdated).toBeTruthy();
    expect(checkPointUpdated._id).toBeTruthy();
    expect(checkPointUpdated.name).toStrictEqual('TestCheckPoint1');
    expect(checkPointUpdated.macAddress).toStrictEqual('111111');
    expect(checkPointUpdated.asset).toBeTruthy();
    expect(checkPointUpdated.asset!.name).toStrictEqual(asset!.name);
    expect(checkPointUpdated.map!.name).toStrictEqual(map!.name);

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.checkPoints).toHaveLength(1);
    expect(assetUpdated!.checkPoints.filter((c) => c.name === checkPoint!.name)).toHaveLength(0);
    expect(assetUpdated!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(1);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints).toHaveLength(1);
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPoint!.name)).toHaveLength(0);
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(1);

    done();
  });

  // noinspection DuplicatedCode
  it('Update a checkPoint - Send name, macAddress and asset', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const checkPointUpdated: CheckPoint = await updateCheckPoint(
            checkPoint!._id,
            'TestCheckPoint1',
            '111111',
            asset!._id,
    );

    expect(checkPointUpdated).toBeTruthy();
    expect(checkPointUpdated._id).toBeTruthy();
    expect(checkPointUpdated.name).toStrictEqual('TestCheckPoint1');
    expect(checkPointUpdated.macAddress).toStrictEqual('111111');
    expect(checkPointUpdated.asset).toBeTruthy();
    expect(checkPointUpdated.asset!.name).toStrictEqual(asset!.name);
    expect(checkPointUpdated.map).not.toBeTruthy();

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.checkPoints).toHaveLength(1);
    expect(assetUpdated!.checkPoints.filter((c) => c.name === checkPoint!.name)).toHaveLength(0);
    expect(assetUpdated!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(1);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints).toHaveLength(0);

    done();
  });

  // noinspection DuplicatedCode
  it('Update a checkPoint - Send name, macAddress and map (without asset)', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const checkPointUpdated: CheckPoint = await updateCheckPoint(
            checkPoint!._id,
            'TestCheckPoint1',
            '111111',
            map!._id,
    );

    expect(checkPointUpdated).toBeTruthy();
    expect(checkPointUpdated._id).toBeTruthy();
    expect(checkPointUpdated.name).toStrictEqual('TestCheckPoint1');
    expect(checkPointUpdated.macAddress).toStrictEqual('111111');
    expect(checkPointUpdated.asset).not.toBeTruthy();
    expect(checkPointUpdated.map).not.toBeTruthy();

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.checkPoints).toHaveLength(0);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints).toHaveLength(0);

    done();
  });

  // noinspection DuplicatedCode
  it('Update a checkPoint - Send name, macAddress, asset1 and map2 (map2 does not belong asset1)', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const map2: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(map2).toBeTruthy();

    const checkPointUpdated: CheckPoint = await updateCheckPoint(
            checkPoint!._id,
            'TestCheckPoint1',
            '111111',
            asset!._id,
            map2!._id,
    );

    expect(checkPointUpdated).toBeTruthy();
    expect(checkPointUpdated._id).toBeTruthy();
    expect(checkPointUpdated.name).toStrictEqual('TestCheckPoint1');
    expect(checkPointUpdated.macAddress).toStrictEqual('111111');
    expect(checkPointUpdated.asset).toBeTruthy();
    expect(checkPointUpdated.asset!.name).toStrictEqual(asset!.name);
    expect(checkPointUpdated.map).not.toBeTruthy();

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.checkPoints).toHaveLength(1);
    expect(assetUpdated!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(1);

    const map1Updated = await MapDoc.findOne({name: 'Map1'});
    expect(map1Updated).toBeTruthy();
    expect(map1Updated!.checkPoints).toHaveLength(0);

    const map2Updated = await MapDoc.findOne({name: 'Map2'});
    expect(map2Updated).toBeTruthy();
    expect(map2Updated!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(0);

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
    expect(checkPointPositioned!.asset).toBeTruthy();
    expect(checkPointPositioned!.map).toBeTruthy();
    expect(checkPointPositioned!.x).toStrictEqual(1000);
    expect(checkPointPositioned!.y).toStrictEqual(900);

    done();
  });

  // noinspection DuplicatedCode
  it('Update a positioned checkPoint - Send name, macAddress, asset2 and map2', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const asset2: Asset | null = await AssetDoc.findOne({name: 'Asset2'});
    expect(asset2).toBeTruthy();

    const map2: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(map2).toBeTruthy();

    const checkPointPositioned: CheckPoint | null = await updateCheckPointPosition(
            checkPoint!._id,
            1000,
            900,
    );
    expect(checkPointPositioned).toBeTruthy();
    expect(checkPointPositioned!.x).toStrictEqual(1000);
    expect(checkPointPositioned!.y).toStrictEqual(900);

    const checkPointUpdated: CheckPoint = await updateCheckPoint(
            checkPoint!._id,
            'TestCheckPoint1',
            '111111',
            asset2!._id,
            map2!._id,
    );

    expect(checkPointUpdated).toBeTruthy();
    expect(checkPointUpdated._id).toBeTruthy();
    expect(checkPointUpdated.name).toStrictEqual('TestCheckPoint1');
    expect(checkPointUpdated.macAddress).toStrictEqual('111111');
    expect(checkPointUpdated.asset).toBeTruthy();
    expect(checkPointUpdated.asset!.name).toStrictEqual(asset2!.name);
    expect(checkPointUpdated.map).toBeTruthy();
    expect(checkPointUpdated.map!.name).toStrictEqual(map2!.name);
    expect(checkPointUpdated.x).not.toBeTruthy();
    expect(checkPointUpdated.y).not.toBeTruthy();

    const asset1Updated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset1Updated).toBeTruthy();
    expect(asset1Updated!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(0);

    const asset2Updated: Asset | null = await AssetDoc.findOne({name: 'Asset2'});
    expect(asset2Updated).toBeTruthy();
    expect(asset2Updated!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(1);

    const map1Updated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map1Updated).toBeTruthy();
    expect(map1Updated!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(0);

    const map2Updated: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(map2Updated).toBeTruthy();
    expect(map2Updated!.checkPoints.filter((c) => c.name === checkPointUpdated.name)).toHaveLength(1);

    done();
  });

  // </editor-fold>

  // <editor-fold desc="DELETE">

  it('Delete a checkPoint', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();
    expect(asset!.checkPoints.filter((c) => c.name === checkPoint!.name)).toHaveLength(1);

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();
    expect(map!.checkPoints.filter((c) => c.name === checkPoint!.name)).toHaveLength(1);

    const res: any = await deleteCheckPoint(checkPoint!._id);
    expect(res).toBeTruthy();
    expect(res.deletedCount).toStrictEqual(1);

    const checkPointDeleted: CheckPoint | null = await findCheckPointById(checkPoint!._id);
    expect(checkPointDeleted).not.toBeTruthy();

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.checkPoints.filter((c) => c.name === checkPoint!.name)).toHaveLength(0);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPoint!.name)).toHaveLength(0);

    done();
  });

  // </editor-fold>
});
