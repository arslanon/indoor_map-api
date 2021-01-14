'use strict';

const supertest = require('supertest');
const app = require('./../web');
const request = supertest(app);
const fs = require('mz/fs');
const { AssetModel } = require("../models/asset.model");
const { MapModel } = require("../models/map.model");
const { setupDB } = require('../shared/db-test-setup');

describe('Map CRUD API / Image Layer Parsing', () => {

    setupDB('indoorMap-testDb-map', ['map']);

    jest.setTimeout(50000);

    it('GET /api/map - get all maps', async (done) => {

        /**
         * @type {request.Response}
         */
        const res = await request
            .get('/api/map');

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(3);

        done();
    });

    it('GET /api/map/:id - get a map', async (done) => {

        const map = await MapModel.findOne({name: 'Map1'});

        /**
         * @type {request.Response}
         */
        const res = await request
            .get(`/api/map/${map._id}`);

        expect(res.status).toBe(200);
        expect(res.body._id.toString()).toStrictEqual(map._id.toString());
        expect(res.body.name).toStrictEqual('Map1');

        done();
    });

    it('POST /api/map - create map and whether asset maps update also', async (done) => {

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const filePath = `images/ai.jpg`;
        if(! (await fs.exists(filePath))) throw new Error('file does not exists!');

        /**
         * @type {request.Response}
         */
        const res = await request
            .post('/api/map')
            .set('Accept', 'application/json')
            .attach('image', filePath)
            .field({
                name: 'TestMap1',
                assetId: asset._id.toString()
            });

        expect(res.status).toBe(200);
        const map = res.body;

        expect(map._id).toBeTruthy();
        expect(map.name).toStrictEqual('TestMap1');
        expect(map.path).toBeTruthy();
        expect(map.width).toBeTruthy();
        expect(map.height).toBeTruthy();
        expect(map.maxZoom).toBeTruthy();
        expect(map.checkPoints).toHaveLength(0);

        await fs.rmdirSync(`uploads/maps/${map._id}`, { recursive: true });

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.maps).toHaveLength(2);
        expect(assetUpdated.maps.filter(m => m.name === map.name)).toHaveLength(1);

        done();
    });

    it('POST /api/map - create map without an image', async (done) => {

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        /**
         * @type {request.Response}
         */
        const res = await request
            .post('/api/map')
            .field({
                name: 'TestMap1',
                assetId: asset._id.toString()
            });

        expect(res.status).toBe(200);
        const map = res.body;

        expect(map._id).toBeTruthy();
        expect(map.name).toStrictEqual('TestMap1');
        expect(map.path).not.toBeTruthy();
        expect(map.width).not.toBeTruthy();
        expect(map.height).not.toBeTruthy();
        expect(map.maxZoom).not.toBeTruthy();
        expect(map.checkPoints).toHaveLength(0);

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated).toBeTruthy();
        expect(assetUpdated.maps.filter(m => m.name === map.name)).toHaveLength(1);

        done();
    });

    it('PUT /api/map/:id - update a map and whether asset maps update also', async (done) => {

        const map1 = await MapModel.findOne({name: 'Map1'});
        expect(map1).toBeTruthy();

        const asset2 = await AssetModel.findOne({name: 'Asset2'});
        expect(asset2).toBeTruthy();

        const filePath = `images/frog.png`;
        if(! (await fs.exists(filePath))) throw new Error('file does not exists!');

        /**
         * @type {request.Response}
         */
        const res = await request
            .put(`/api/map/${map1._id}`)
            .attach('image', filePath)
            .field({
                name: 'TestMap1',
                assetId: asset2._id.toString()
            });

        expect(res.status).toBe(200);
        const map1Updated = res.body;

        expect(map1Updated._id.toString()).toStrictEqual(map1._id.toString());
        expect(map1Updated.name).toStrictEqual('TestMap1');
        expect(map1Updated.path).toBeTruthy();
        expect(map1Updated.width).toBeTruthy();
        expect(map1Updated.height).toBeTruthy();
        expect(map1Updated.maxZoom).toBeTruthy();
        expect(map1Updated.checkPoints).toHaveLength(0);
        expect(map1Updated.asset).toBeTruthy();
        expect(map1Updated.asset._id.toString()).toStrictEqual(asset2._id.toString());

        const asset1Updated = await AssetModel.findOne({name: 'Asset1'});
        expect(asset1Updated).toBeTruthy();
        expect(asset1Updated.maps.filter(m => m.name === map1.name)).toHaveLength(0);
        expect(asset1Updated.maps.filter(m => m.name === map1Updated.name)).toHaveLength(0);

        const asset2Updated = await AssetModel.findOne({name: 'Asset2'});
        expect(asset2Updated).toBeTruthy();
        expect(asset2Updated.maps.filter(m => m.name === map1.name)).toHaveLength(0);
        expect(asset2Updated.maps.filter(m => m.name === map1Updated.name)).toHaveLength(1);

        await fs.rmdirSync(`uploads/maps/${res.body._id}`, { recursive: true });

        done();
    });

    it('DELETE /api/map/:id - delete a map and whether asset maps update also', async (done) => {

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();
        expect(asset.maps.filter(m => m.name === map.name)).toHaveLength(1);

        /**
         * @type {request.Response}
         */
        const res = await request
            .delete(`/api/map/${map._id}`);

        expect(res.status).toBe(200);
        expect(res.body).toBeTruthy();
        expect(res.body.deletedCount).toStrictEqual(1);

        const assetUpdated = await AssetModel.findOne({name: 'Asset1'});
        expect(assetUpdated.maps.filter(m => m.name === map.name)).toHaveLength(0);

        done();
    });
})