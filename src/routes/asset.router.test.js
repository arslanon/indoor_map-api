'use strict';

const supertest = require('supertest');
const app = require('./../web');
const request = supertest(app);
const { AssetModel } = require("../models/asset.model");
const { setupDB } = require('../shared/db-test-setup');

describe('Asset CRUD API', () => {

    setupDB('indoorMap-testDb-asset', ['asset']);

    jest.setTimeout(50000);

    it('GET /api/asset - get all assets', async (done) => {

        /**
         * @type {request.Response}
         */
        const res = await request
            .get('/api/asset')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);

        done();
    });

    it('POST /api/asset - create an asset', async (done) => {

        /**
         * @type {request.Response}
         */
        const res = await request
            .post('/api/asset')
            .send({name: "Flip"})
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json');

        expect(res.status).toBe(200);
        expect(res.body._id).toBeTruthy();
        expect(res.body.name).toStrictEqual("Flip");

        done();
    });

    it('GET /api/asset/:id - get an asset', async (done) => {

        const asset = await AssetModel.findOne({name: 'Asset1'});

        /**
         * @type {request.Response}
         */
        const res = await request
            .get(`/api/asset/${asset._id}`)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json');

        expect(res.status).toBe(200);
        expect(res.body._id).toBeTruthy();
        expect(res.body.name).toStrictEqual('Asset1');

        done();
    });

    it('PUT /api/asset/:id - update an asset', async (done) => {

        const asset = await AssetModel.findOne({name: 'Asset1'});

        /**
         * @type {request.Response}
         */
        const res = await request
            .put(`/api/asset/${asset._id}`)
            .send({name: "Asset11"})
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json');

        expect(res.status).toBe(200);
        expect(res.body._id).toBeTruthy();
        expect(res.body.name).toStrictEqual('Asset11');

        done()
    });

    it('DELETE /api/asset/:id - delete an asset', async (done) => {

        const asset = new AssetModel({
            name: 'Flip'
        });
        await asset.save();

        /**
         * @type {request.Response}
         */
        const res = await request
            .delete(`/api/asset/${asset._id}`)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json');

        expect(res.status).toBe(200)
        expect(res.body).toBeTruthy()
        expect(res.body.deletedCount).toStrictEqual(1)

        done()
    });
})