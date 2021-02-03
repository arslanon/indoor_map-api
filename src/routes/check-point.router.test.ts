import supertest, {Response} from 'supertest';
import app from '../app';
import fs from 'mz/fs';
import setupTestDatabase from '../shared/db-test-setup';
import AssetDoc, {Asset} from '../models/asset.model';
import MapDoc, {Map} from '../models/map.model';
const request = supertest(app);
import  CheckPointDoc, {CheckPoint} from "../models/check-point.model";

describe('Check Point CRUD API', () => {

    setupTestDatabase('indoorMap-testDb-checkPoint', ['checkPoint']);

    jest.setTimeout(50000);

    it('GET /api/checkPoint - get all check points by map', async (done) => {

        const checkPoint = await CheckPointDoc.findOne({name: 'CheckPoint1'});

        /**
         * @type {request.Response}
         */
        const res: Response = await request
            .get(`/api/checkPoint/${checkPoint!._id}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);

        done();
    });

    it('POST /api/checkPoint/csv - create a check points with csv', async (done) => {

        const filePath = `files/demo.csv`;
        if(! (await fs.exists(filePath))) throw new Error('file does not exists!');

        const asset = await AssetDoc.findOne({name: 'Asset1'});
        expect(asset).toBeTruthy();

        const map = await MapDoc.findOne({name: 'Map1'});
        expect(map).toBeTruthy();
        /**
         * @type {request.Response}
         */
        const res: Response = await request
            .post('/api/checkPoint/csv')
            .set('Accept', 'application/json')
            .attach('csv', filePath)
            .field({
                assetId: asset!._id.toString(),
                mapId: map!._id.toString()
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);

        done();
    });
})
