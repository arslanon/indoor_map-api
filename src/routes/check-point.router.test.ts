import supertest, {Response} from 'supertest';
import app from '../app';
import fs from 'mz/fs';
import setupTestDatabase from '../shared/db-test-setup';
import AssetDoc from '../models/asset.model';
import MapDoc from '../models/map.model';
const request = supertest(app);

describe('Check Point CRUD API', () => {

    setupTestDatabase('indoorMap-testDb-checkPoint', ['checkPoint']);

    jest.setTimeout(50000);

    it('POST /api/checkPoint/csv - create a check points with csv', async (done) => {

        const filePath = `files/checkpoints.csv`;
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
