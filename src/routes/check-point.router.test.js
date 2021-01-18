'use strict';

const supertest = require('supertest');
const app = require('./../web');
const request = supertest(app);
const { CheckPointModel } = require("../models/check-point.model");
const { MapModel } = require("../models/map.model");
const { AssetModel } = require("../models/asset.model");
const { setupDB } = require('../shared/db-test-setup');
const fs = require('mz/fs');

describe('Check Point CRUD API', () => {

    setupDB('indoorMap-testDb-checkPoint', ['checkPoint']);

    jest.setTimeout(50000);

    it('GET /api/checkPoint - get all check points by map', async (done) => {

        const checkPoint = await CheckPointModel.findOne({name: 'CheckPoint1'});

        /**
         * @type {request.Response}
         */
        const res = await request
            .get(`/api/checkPoint/${checkPoint._id}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);

        done();
    });

    it('POST /api/checkPoint/csv - create a check points with csv', async (done) => {

        const filePath = `files/demo.csv`;
        if(! (await fs.exists(filePath))) throw new Error('file does not exists!');

        const asset = await AssetModel.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const map = await MapModel.findOne({name: 'Map1'});
        expect(map).toBeTruthy();
        /**
         * @type {request.Response}
         */
        const res = await request
            .post('/api/checkPoint/csv')
            .set('Accept', 'application/json')
            .attach('csv', filePath)
            .field({
                assetId: asset._id.toString(),
                mapId: map._id.toString()
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);

        done();
    });
})