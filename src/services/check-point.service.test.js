'use strict';

const { AssetModel } = require("../models/asset.model");
const { MapModel } = require("../models/map.model");
const { CheckPointModel } = require("../models/check-point.model");
const {
    findCheckPointsByMap,
    findCheckPointById,
    createCheckPoint,
    updateCheckPoint,
    updateCheckPointPosition,
    deleteCheckPoint
} = require("./check-point.service");
const { setupDB } = require('../shared/db-test-setup');

describe('CheckPoint Service CRUD', () => {

    setupDB('indoorMap-testDb-checkPoint', ['checkPoint']);

    jest.setTimeout(50000);

    // <editor-fold desc="FIND">

    it('Find checkPoints', async (done) => {

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();

        const checkPoints = await findCheckPointsByMap(map);

        expect(checkPoints).toBeTruthy();
        expect(checkPoints).toHaveLength(1);

        done();
    });

    it('Find a checkPoint', async (done) => {

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'});
        expect(checkPoint).toBeTruthy();

        const checkPointFound = await findCheckPointById(checkPoint._id);

        expect(checkPointFound).toBeTruthy();
        expect(checkPointFound._id).toBeTruthy();
        expect(checkPointFound.name).toStrictEqual("CheckPoint1");
        expect(checkPointFound.macAddress).toBeTruthy();
        expect(checkPointFound.asset).toBeTruthy();
        expect(checkPointFound.asset.name).toStrictEqual("Asset1");
        expect(checkPointFound.map).toBeTruthy();
        expect(checkPointFound.map.name).toStrictEqual("Map1");
        expect(checkPointFound.x).not.toBeTruthy();
        expect(checkPointFound.y).not.toBeTruthy();

        done();
    });

    // </editor-fold>

    // <editor-fold desc="CREATE">

    it('Create a checkPoint - Send name, macAddress, asset and map', async (done) => {

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();

        const checkPoint = await createCheckPoint({
            name: 'TestCheckPoint1',
            macAddress: '111111',
            assetId: asset._id,
            mapId: map._id
        });

        expect(checkPoint).toBeTruthy();
        expect(checkPoint._id).toBeTruthy();
        expect(checkPoint.name).toStrictEqual("TestCheckPoint1");
        expect(checkPoint.macAddress).toStrictEqual("111111");
        expect(checkPoint.asset.name).toStrictEqual(asset.name);
        expect(checkPoint.map.name).toStrictEqual(map.name);

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(1);

        const mapUpdated = await MapModel.findOne({name: 'Map1'});
        expect(mapUpdated).toBeTruthy();
        expect(mapUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(1);

        done();
    });

    it('Create a checkPoint - Send name, macAddress and asset', async (done) => {

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const checkPoint = await createCheckPoint({
            name: 'TestCheckPoint1',
            macAddress: '111111',
            assetId: asset._id
        });

        expect(checkPoint).toBeTruthy();
        expect(checkPoint._id).toBeTruthy();
        expect(checkPoint.name).toStrictEqual("TestCheckPoint1");
        expect(checkPoint.macAddress).toStrictEqual("111111");
        expect(checkPoint.asset.name).toStrictEqual(asset.name);
        expect(checkPoint.map).not.toBeTruthy();

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(1);

        const mapUpdated = await MapModel.findOne({name: 'Map1'});
        expect(mapUpdated).toBeTruthy();
        expect(mapUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);

        done();
    });

    it('Create a checkPoint - Send name, macAddress and map', async (done) => {

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();

        const checkPoint = await createCheckPoint({
            name: 'TestCheckPoint1',
            macAddress: '111111',
            mapId: map._id
        });

        expect(checkPoint).toBeTruthy();
        expect(checkPoint._id).toBeTruthy();
        expect(checkPoint.name).toStrictEqual("TestCheckPoint1");
        expect(checkPoint.macAddress).toStrictEqual("111111");
        expect(checkPoint.asset).not.toBeTruthy();
        expect(checkPoint.map).not.toBeTruthy();

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);

        const mapUpdated = await MapModel.findOne({name: 'Map1'});
        expect(mapUpdated).toBeTruthy();
        expect(mapUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);

        done();
    });

    it('Create a checkPoint - Send name and macAddress', async (done) => {

        const checkPoint = await createCheckPoint({
            name: 'TestCheckPoint1',
            macAddress: '111111',
        });

        expect(checkPoint).toBeTruthy();
        expect(checkPoint._id).toBeTruthy();
        expect(checkPoint.name).toStrictEqual("TestCheckPoint1");
        expect(checkPoint.macAddress).toStrictEqual("111111");
        expect(checkPoint.asset).not.toBeTruthy();
        expect(checkPoint.map).not.toBeTruthy();

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);

        const mapUpdated = await MapModel.findOne({name: 'Map1'});
        expect(mapUpdated).toBeTruthy();
        expect(mapUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);

        done();
    });

    it('Create a checkPoint - Send name, macAddress, asset1 and map2 (map2 does not belong asset1)', async (done) => {

        const asset1 = await AssetModel.findOne({name: 'Asset1'});
        expect(asset1).toBeTruthy();

        const map1 = await MapModel.findOne({name: 'Map1'});
        expect(map1).toBeTruthy();

        const map2 = await MapModel.findOne({name: 'Map2'});
        expect(map2).toBeTruthy();

        const checkPoint = await createCheckPoint({
            name: 'TestCheckPoint1',
            macAddress: '111111',
            assetId: asset1._id,
            mapId: map2._id
        });

        expect(checkPoint).toBeTruthy();
        expect(checkPoint._id).toBeTruthy();
        expect(checkPoint.name).toStrictEqual("TestCheckPoint1");
        expect(checkPoint.macAddress).toStrictEqual("111111");
        expect(checkPoint.asset.name).toStrictEqual(asset1.name);
        expect(checkPoint.map).not.toBeTruthy();

        const asset1Updated = await AssetModel.findOne({name: 'Asset1'});
        expect(asset1Updated).toBeTruthy();
        expect(asset1Updated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(1);

        const map1Updated = await MapModel.findOne({name: 'Map1'});
        expect(map1Updated).toBeTruthy();
        expect(map1Updated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);

        const map2Updated = await MapModel.findOne({name: 'Map2'});
        expect(map2Updated).toBeTruthy();
        expect(map2Updated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);

        done();
    });

    // </editor-fold>

    // <editor-fold desc="UPDATE">

    it('Update a checkPoint - Send name and macAddress', async (done) => {

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'})
        expect(checkPoint).toBeTruthy();

        const checkPointUpdated = await updateCheckPoint(checkPoint, {
            name: 'TestCheckPoint1',
            macAddress: '111111'
        });

        expect(checkPointUpdated).toBeTruthy();
        expect(checkPointUpdated._id).toBeTruthy();
        expect(checkPointUpdated.name).toStrictEqual("TestCheckPoint1");
        expect(checkPointUpdated.macAddress).toStrictEqual("111111");
        expect(checkPointUpdated.asset).not.toBeTruthy();
        expect(checkPointUpdated.map).not.toBeTruthy();

        const assetUpdated1 = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated1).toBeTruthy();
        expect(assetUpdated1.checkPoints).toHaveLength(0);

        const mapUpdated1 = await MapModel.findOne({name: 'Map1'});
        expect(mapUpdated1).toBeTruthy();
        expect(mapUpdated1.checkPoints).toHaveLength(0);

        done();
    });

    it('Update a checkPoint - Send name, macAddress, asset and map', async (done) => {

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'})
        expect(checkPoint).toBeTruthy();

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();

        const checkPointUpdated = await updateCheckPoint(checkPoint, {
            name: 'TestCheckPoint1',
            macAddress: '111111',
            assetId: asset._id,
            mapId: map._id
        });

        expect(checkPointUpdated).toBeTruthy();
        expect(checkPointUpdated._id).toBeTruthy();
        expect(checkPointUpdated.name).toStrictEqual("TestCheckPoint1");
        expect(checkPointUpdated.macAddress).toStrictEqual("111111");
        expect(checkPointUpdated.asset.name).toStrictEqual(asset.name);
        expect(checkPointUpdated.map.name).toStrictEqual(map.name);

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.checkPoints).toHaveLength(1);
        expect(assetUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);
        expect(assetUpdated.checkPoints.filter(c => c.name === checkPointUpdated.name)).toHaveLength(1);

        const mapUpdated = await MapModel.findOne({name: 'Map1'});
        expect(mapUpdated).toBeTruthy();
        expect(mapUpdated.checkPoints).toHaveLength(1);
        expect(mapUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);
        expect(mapUpdated.checkPoints.filter(c => c.name === checkPointUpdated.name)).toHaveLength(1);

        done();
    });

    it('Update a checkPoint - Send name, macAddress and asset', async (done) => {

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'})
        expect(checkPoint).toBeTruthy();

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();

        const checkPointUpdated = await updateCheckPoint(checkPoint, {
            name: 'TestCheckPoint1',
            macAddress: '111111',
            assetId: asset._id
        });

        expect(checkPointUpdated).toBeTruthy();
        expect(checkPointUpdated._id).toBeTruthy();
        expect(checkPointUpdated.name).toStrictEqual("TestCheckPoint1");
        expect(checkPointUpdated.macAddress).toStrictEqual("111111");
        expect(checkPointUpdated.asset.name).toStrictEqual(asset.name);
        expect(checkPointUpdated.map).not.toBeTruthy();

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.checkPoints).toHaveLength(1);
        expect(assetUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);
        expect(assetUpdated.checkPoints.filter(c => c.name === checkPointUpdated.name)).toHaveLength(1);

        const mapUpdated = await MapModel.findOne({name: 'Map1'});
        expect(mapUpdated).toBeTruthy();
        expect(mapUpdated.checkPoints).toHaveLength(0);

        done();
    });

    it('Update a checkPoint - Send name, macAddress and map (without asset)', async (done) => {

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'})
        expect(checkPoint).toBeTruthy();

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();

        const checkPointUpdated = await updateCheckPoint(checkPoint, {
            name: 'TestCheckPoint1',
            macAddress: '111111',
            mapId: map._id
        });

        expect(checkPointUpdated).toBeTruthy();
        expect(checkPointUpdated._id).toBeTruthy();
        expect(checkPointUpdated.name).toStrictEqual("TestCheckPoint1");
        expect(checkPointUpdated.macAddress).toStrictEqual("111111");
        expect(checkPointUpdated.asset).not.toBeTruthy();
        expect(checkPointUpdated.map).not.toBeTruthy();

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.checkPoints).toHaveLength(0);

        const mapUpdated = await MapModel.findOne({name: 'Map1'});
        expect(mapUpdated).toBeTruthy();
        expect(mapUpdated.checkPoints).toHaveLength(0);

        done();
    });

    it('Update a checkPoint - Send name, macAddress, asset1 and map2 (map2 does not belong asset1)', async (done) => {

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'})
        expect(checkPoint).toBeTruthy();

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const map1 = await MapModel.findOne({name: 'Map1'});
        expect(map1).toBeTruthy();
        const map2 = await MapModel.findOne({name: 'Map2'});
        expect(map2).toBeTruthy();

        const checkPointUpdated = await updateCheckPoint(checkPoint, {
            name: 'TestCheckPoint1',
            macAddress: '111111',
            assetId: asset._id,
            mapId: map2._id
        });

        expect(checkPointUpdated).toBeTruthy();
        expect(checkPointUpdated._id).toBeTruthy();
        expect(checkPointUpdated.name).toStrictEqual("TestCheckPoint1");
        expect(checkPointUpdated.macAddress).toStrictEqual("111111");
        expect(checkPointUpdated.asset.name).toStrictEqual(asset.name);
        expect(checkPointUpdated.map).not.toBeTruthy();

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.checkPoints).toHaveLength(1);
        expect(assetUpdated.checkPoints.filter(c => c.name === checkPointUpdated.name)).toHaveLength(1);

        const map1Updated = await MapModel.findOne({name: 'Map1'});
        expect(map1Updated).toBeTruthy();
        expect(map1Updated.checkPoints).toHaveLength(0);

        const map2Updated = await MapModel.findOne({name: 'Map2'});
        expect(map2Updated).toBeTruthy();
        expect(map2Updated.checkPoints.filter(c => c.name === checkPointUpdated.name)).toHaveLength(0);

        done();
    });

    it('Update a checkPoint position', async (done) => {

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'})
        expect(checkPoint).toBeTruthy();

        const checkPointPositioned = await updateCheckPointPosition(checkPoint, {
            x: 1000,
            y: 900
        });
        expect(checkPointPositioned).toBeTruthy();
        expect(checkPointPositioned._id).toBeTruthy();
        expect(checkPointPositioned.name).toBeTruthy();
        expect(checkPointPositioned.macAddress).toBeTruthy();
        expect(checkPointPositioned.asset).toBeTruthy();
        expect(checkPointPositioned.map).toBeTruthy();
        expect(checkPointPositioned.x).toStrictEqual(1000);
        expect(checkPointPositioned.y).toStrictEqual(900);

        done();
    });

    it('Update a positioned checkPoint - Send name, macAddress, asset2 and map2', async (done) => {

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'})
        expect(checkPoint).toBeTruthy();

        const asset2 = await AssetModel.findOne({name: 'Asset2'});
        expect(asset2).toBeTruthy();

        const map2 = await MapModel.findOne({name: 'Map2'});
        expect(map2).toBeTruthy();

        const checkPointPositioned = await updateCheckPointPosition(checkPoint, {
            x: 1000,
            y: 900
        });
        expect(checkPointPositioned).toBeTruthy();
        expect(checkPointPositioned.x).toStrictEqual(1000);
        expect(checkPointPositioned.y).toStrictEqual(900);

        const checkPointUpdated = await updateCheckPoint(checkPoint, {
            name: 'TestCheckPoint1',
            macAddress: '111111',
            assetId: asset2._id,
            mapId: map2._id
        });

        expect(checkPointUpdated).toBeTruthy();
        expect(checkPointUpdated._id).toBeTruthy();
        expect(checkPointUpdated.name).toStrictEqual("TestCheckPoint1");
        expect(checkPointUpdated.macAddress).toStrictEqual("111111");
        expect(checkPointUpdated.asset).toBeTruthy();
        expect(checkPointUpdated.asset.name).toStrictEqual(asset2.name);
        expect(checkPointUpdated.map).toBeTruthy();
        expect(checkPointUpdated.map.name).toStrictEqual(map2.name);
        expect(checkPointUpdated.x).not.toBeTruthy();
        expect(checkPointUpdated.y).not.toBeTruthy();

        const asset1Updated = await AssetModel.findOne({name: 'Asset1'});
        expect(asset1Updated).toBeTruthy();
        expect(asset1Updated.checkPoints.filter(c => c.name === checkPointUpdated.name)).toHaveLength(0);

        const asset2Updated = await AssetModel.findOne({name: 'Asset2'});
        expect(asset2Updated).toBeTruthy();
        expect(asset2Updated.checkPoints.filter(c => c.name === checkPointUpdated.name)).toHaveLength(1);

        const map1Updated = await MapModel.findOne({name: 'Map1'});
        expect(map1Updated).toBeTruthy();
        expect(map1Updated.checkPoints.filter(c => c.name === checkPointUpdated.name)).toHaveLength(0);

        const map2Updated = await MapModel.findOne({name: 'Map2'});
        expect(map2Updated).toBeTruthy();
        expect(map2Updated.checkPoints.filter(c => c.name === checkPointUpdated.name)).toHaveLength(1);

        done();
    });

    // </editor-fold>

    // <editor-fold desc="DELETE">

    it('Delete a checkPoint', async (done) => {

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'})
        expect(checkPoint).toBeTruthy();

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();
        expect(asset.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(1);

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();
        expect(map.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(1);

        const res = await deleteCheckPoint(checkPoint._id);
        expect(res).toBeTruthy();
        expect(res.deletedCount).toStrictEqual(1);

        const checkPointDeleted = await findCheckPointById(checkPoint._id);
        expect(checkPointDeleted).not.toBeTruthy();

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);

        const mapUpdated = await MapModel.findOne({name: 'Map1'});
        expect(mapUpdated).toBeTruthy();
        expect(mapUpdated.checkPoints.filter(c => c.name === checkPoint.name)).toHaveLength(0);

        done();
    });

    // </editor-fold>
})