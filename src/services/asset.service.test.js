'use strict';

const { AssetModel } = require("../models/asset.model");
const { MapModel } = require("../models/map.model");
const { CheckPointModel } = require("../models/check-point.model");
const {
    findAssets,
    findAssetById,
    createAsset,
    updateAsset,
    deleteAsset
} = require("./asset.service");
const { setupDB } = require('../shared/db-test-setup');

describe('Asset Service CRUD', () => {

    setupDB('indoorMap-testDb-asset', ['checkPoint']);

    jest.setTimeout(50000);

    // <editor-fold desc="FIND">

    it('Find assets', async (done) => {

        const assets = await findAssets();

        expect(assets).toBeTruthy();
        expect(assets).toHaveLength(3);

        done();
    });

    it('Find an asset', async (done) => {

        const asset = await AssetModel.findOne({name: 'Asset1'});

        const assetFound = await findAssetById(asset._id)

        expect(assetFound).toBeTruthy();
        expect(assetFound._id).toBeTruthy();
        expect(assetFound.name).toStrictEqual("Asset1");
        expect(assetFound.maps).toHaveLength(1);
        expect(assetFound.checkPoints).toHaveLength(1);

        done();
    });

    // </editor-fold>

    // <editor-fold desc="CREATE">

    it('Create an asset', async (done) => {

        const asset = await createAsset({
            name: 'TestAsset1'
        });

        expect(asset).toBeTruthy();
        expect(asset._id).toBeTruthy();
        expect(asset.name).toStrictEqual("TestAsset1");
        expect(asset.maps).toHaveLength(0);
        expect(asset.checkPoints).toHaveLength(0);

        done();
    });

    // </editor-fold>

    // <editor-fold desc="UPDATE">

    it('Update an asset', async (done) => {

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const assetUpdated = await updateAsset(asset, {
            name: 'TestAsset2'
        });

        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated._id).toBeTruthy();
        expect(assetUpdated.name).toStrictEqual("TestAsset2");
        expect(assetUpdated.maps).toHaveLength(1);

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();
        expect(map.asset).toBeTruthy();
        expect(map.asset.name).toStrictEqual(assetUpdated.name);

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'});
        expect(checkPoint).toBeTruthy();
        expect(checkPoint.asset).toBeTruthy();
        expect(checkPoint.asset.name).toStrictEqual(assetUpdated.name);

        done();
    });

    // </editor-fold>

    // <editor-fold desc="DELETE">

    it('Delete an asset', async (done) => {

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();
        expect(map.asset).toBeTruthy();

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'});
        expect(checkPoint).toBeTruthy();
        expect(checkPoint.asset).toBeTruthy();

        await expect(deleteAsset(map._id)).rejects.toThrow();

        await AssetModel.findOneAndUpdate({_id: asset._id}, {$pull: {maps: {_id: map._id}, checkPoints: {_id: checkPoint._id}}});
        await MapModel.deleteOne({_id: map._id});
        await CheckPointModel.deleteOne({_id: checkPoint._id});

        const res = await deleteAsset(asset._id);
        expect(res).toBeTruthy();
        expect(res.deletedCount).toStrictEqual(1);

        const mapUpdated = await MapModel.findOne({name: 'Map1'});
        expect(mapUpdated).not.toBeTruthy();

        const checkPointUpdated = await CheckPointModel.findOne({name: 'CheckPoint1'});
        expect(checkPointUpdated).not.toBeTruthy();

        done();
    });

    // </editor-fold>
})