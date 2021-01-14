'use strict';

const { AssetModel } = require("../models/asset.model");
const { MapModel } = require("../models/map.model");
const { CheckPointModel } = require("../models/check-point.model");
const {
    findMaps,
    findMapById,
    createMap,
    updateMap,
    deleteMap
} = require("./map.service");
const { setupDB } = require('../shared/db-test-setup');
const fs = require('fs');

describe('Map Service CRUD', () => {

    setupDB('indoorMap-testDb-map', ['checkPoint']);

    jest.setTimeout(50000);

    // <editor-fold desc="FIND">

    it('Find maps', async (done) => {

        const maps = await findMaps();

        expect(maps).toBeTruthy();
        expect(maps).toHaveLength(3);

        done();
    });

    it('Find a map', async (done) => {

        const map = await MapModel.findOne({name: 'Map1'});

        const mapFound = await findMapById(map._id)

        expect(mapFound).toBeTruthy();
        expect(mapFound._id).toBeTruthy();
        expect(mapFound.name).toStrictEqual("Map1");
        expect(mapFound.asset._id).toBeTruthy();

        done();
    });

    // </editor-fold>

    // <editor-fold desc="CREATE">

    it('Create a map - Send name and asset', async (done) => {

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const map = await createMap({
            name: 'TestMap1',
            assetId: asset._id
        });

        expect(map).toBeTruthy();
        expect(map._id).toBeTruthy();
        expect(map.name).toStrictEqual("TestMap1");
        expect(map.asset._id).toStrictEqual(asset._id);

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.maps).toBeTruthy();
        expect(assetUpdated.maps.filter(m => m.name === "TestMap1")).toHaveLength(1);

        done();
    });

    it('Create a map - Send name, asset and filePath', async (done) => {

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        await fs.copyFile(`images/ai.jpg`, `tmp/uploads/ai.jpg`, () => {});

        const map = await createMap(
            {
                name: 'TestMap1',
                assetId: asset._id
            },
            `tmp/uploads/ai.jpg`
        );

        expect(map).toBeTruthy();
        expect(map._id).toBeTruthy();
        expect(map.name).toStrictEqual("TestMap1");
        expect(map.asset).toBeTruthy();
        expect(map.asset._id).toStrictEqual(asset._id);
        expect(map.path).toBeTruthy();
        expect(map.width).toBeTruthy();
        expect(map.height).toBeTruthy();
        expect(map.maxZoom).toBeTruthy();
        expect(map.checkPoints).toHaveLength(0);

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.maps.filter(m => m.name === map.name)).toHaveLength(1);

        await fs.rmdirSync(`uploads/maps/${map._id}`, { recursive: true });

        done();
    });

    it('Create a map - Send name and filePath', async (done) => {

        await fs.copyFile(`images/ai.jpg`, `tmp/uploads/ai.jpg`, () => {});

        const map = await createMap(
            {
                name: 'TestMap1'
            },
            `tmp/uploads/ai.jpg`
        );

        expect(map).toBeTruthy();
        expect(map._id).toBeTruthy();
        expect(map.name).toStrictEqual("TestMap1");
        expect(map.asset).not.toBeTruthy();
        expect(map.path).toBeTruthy();
        expect(map.width).toBeTruthy();
        expect(map.height).toBeTruthy();
        expect(map.maxZoom).toBeTruthy();
        expect(map.checkPoints).toHaveLength(0);

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.maps.filter(m => m.name === map.name)).toHaveLength(0);

        await fs.rmdirSync(`uploads/maps/${map._id}`, { recursive: true });

        done();
    });

    // </editor-fold>

    // <editor-fold desc="UPDATE">

    it('Update a map - Send name and asset', async (done) => {

        const asset2 = await AssetModel.findOne({name: 'Asset2'});
        expect(asset2).toBeTruthy();

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();

        const mapUpdated = await updateMap(map, {
            name: 'TestMap11',
            assetId: asset2._id
        });

        expect(mapUpdated).toBeTruthy();
        expect(mapUpdated._id).toBeTruthy();
        expect(mapUpdated.name).toStrictEqual("TestMap11");
        expect(mapUpdated.asset._id).toStrictEqual(asset2._id);
        expect(mapUpdated.path).toBeTruthy();
        expect(mapUpdated.width).toBeTruthy();
        expect(mapUpdated.height).toBeTruthy();
        expect(mapUpdated.maxZoom).toBeTruthy();

        const asset1Updated = await AssetModel.findOne({name: 'Asset1'});
        expect(asset1Updated).toBeTruthy();
        expect(asset1Updated.maps).toBeTruthy();
        expect(asset1Updated.maps.filter(m => m.name === map.name)).toHaveLength(0);
        expect(asset1Updated.maps.filter(m => m.name === mapUpdated.name)).toHaveLength(0);

        const asset2Updated = await AssetModel.findOne({name: 'Asset2'});
        expect(asset2Updated).toBeTruthy();
        expect(asset2Updated.maps).toBeTruthy();
        expect(asset2Updated.maps.filter(m => m.name === map.name)).toHaveLength(0);
        expect(asset2Updated.maps.filter(m => m.name === mapUpdated.name)).toHaveLength(1);

        const checkPointUpdated = await CheckPointModel.findOne({name: 'CheckPoint1'});
        expect(checkPointUpdated).toBeTruthy();
        expect(checkPointUpdated.map).toBeTruthy();
        expect(checkPointUpdated.map.name).toStrictEqual(mapUpdated.name);

        done();
    });

    it('Update a map - Send name', async (done) => {

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();

        const mapUpdated = await updateMap(map, {
            name: 'TestMap11',
        });

        expect(mapUpdated).toBeTruthy();
        expect(mapUpdated._id).toBeTruthy();
        expect(mapUpdated.name).toStrictEqual("TestMap11");
        expect(mapUpdated.asset).not.toBeTruthy();
        expect(mapUpdated.path).toBeTruthy();
        expect(mapUpdated.width).toBeTruthy();
        expect(mapUpdated.height).toBeTruthy();
        expect(mapUpdated.maxZoom).toBeTruthy();

        const asset1Updated = await AssetModel.findOne({name: 'Asset1'});
        expect(asset1Updated).toBeTruthy();
        expect(asset1Updated.maps).toBeTruthy();
        expect(asset1Updated.maps.filter(m => m.name === map.name)).toHaveLength(0);
        expect(asset1Updated.maps.filter(m => m.name === mapUpdated.name)).toHaveLength(0);

        const checkPointUpdated = await CheckPointModel.findOne({name: 'CheckPoint1'});
        expect(checkPointUpdated).toBeTruthy();
        expect(checkPointUpdated.map).toBeTruthy();
        expect(checkPointUpdated.map.name).toStrictEqual(mapUpdated.name);

        done();
    });

    it('Update a map - Send name and filePath', async (done) => {

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();

        await fs.copyFile(`images/ai.jpg`, `tmp/uploads/ai.jpg`, () => {});

        const mapUpdated = await updateMap(
            map,
            {
                name: 'TestMap11',
            },
            `tmp/uploads/ai.jpg`
        );

        expect(mapUpdated).toBeTruthy();
        expect(mapUpdated._id).toBeTruthy();
        expect(mapUpdated.name).toStrictEqual("TestMap11");
        expect(mapUpdated.asset).not.toBeTruthy();
        expect(mapUpdated.path).toBeTruthy();
        expect(mapUpdated.width).toBeTruthy();
        expect(mapUpdated.height).toBeTruthy();
        expect(mapUpdated.maxZoom).toBeTruthy();
        expect(mapUpdated.checkPoints).toHaveLength(1);

        const asset1Updated = await AssetModel.findOne({name: 'Asset1'});
        expect(asset1Updated).toBeTruthy();
        expect(asset1Updated.maps).toBeTruthy();
        expect(asset1Updated.maps.filter(m => m.name === map.name)).toHaveLength(0);
        expect(asset1Updated.maps.filter(m => m.name === mapUpdated.name)).toHaveLength(0);

        const checkPointUpdated = await CheckPointModel.findOne({name: 'CheckPoint1'});
        expect(checkPointUpdated).toBeTruthy();
        expect(checkPointUpdated.map).toBeTruthy();
        expect(checkPointUpdated.map.name).toStrictEqual(mapUpdated.name);

        await fs.rmdirSync(`uploads/maps/${map._id}`, { recursive: true });

        done();
    });

    // </editor-fold>

    // <editor-fold desc="DELETE">

    it('Delete a map', async (done) => {

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();
        expect(asset.maps.filter(m => m.name === map.name)).toHaveLength(1);

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'});
        expect(checkPoint).toBeTruthy();
        expect(checkPoint.map).toBeTruthy();

        await expect(deleteMap(map._id)).rejects.toThrow();

        await MapModel.findOneAndUpdate({_id: map._id}, {$pull: {checkPoints: {_id: checkPoint._id}}});
        await CheckPointModel.deleteOne({_id: checkPoint._id});

        const res = await deleteMap(map._id);
        expect(res).toBeTruthy();
        expect(res.deletedCount).toStrictEqual(1);

        const mapDeleted = await findMapById(map._id);
        expect(mapDeleted).not.toBeTruthy();

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.maps).toHaveLength(0);

        const checkPointUpdated = await CheckPointModel.findOne({name: 'CheckPoint1'});
        expect(checkPointUpdated).not.toBeTruthy();

        done();
    });

    // </editor-fold>
})