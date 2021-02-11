/* eslint-disable max-len */
import supertest, {Response} from 'supertest';
import app from '../app';
import fs from 'mz/fs';
import setupTestDatabase from '../shared/db-test-setup';
import AssetDoc from '../models/asset.model';
import MapDoc from '../models/map.model';
import {CheckPoint} from '../models/check-point.model';

const request = supertest(app);

describe('Check Point CRUD API', () => {
  setupTestDatabase('indoorMap-testDb-checkPoint', ['checkPoint']);

  jest.setTimeout(50000);

  it('POST /api/checkPoint/csv - create checkPoints via CSV', async (done) => {
    const asset = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const map = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const filePath = `files/checkpoints.csv`;
    if (! (await fs.exists(filePath))) throw new Error('file does not exists!');

    const res: Response = await request
        .post('/api/checkPoint/csv')
        .set('Accept', 'application/json')
        .attach('csv', filePath)
        .field({
          assetId: asset!._id.toString(),
          mapId: map!._id.toString()
        });

    expect(res.status).toBe(200);
    const checkPoints: CheckPoint[] = res.body;

    expect(checkPoints).toHaveLength(3);
    expect(checkPoints.find((c) => c.name === 'CSV CheckPoint 1')).toBeTruthy();
    expect(checkPoints.find((c) => c.name === 'CSV CheckPoint 2')).toBeTruthy();
    expect(checkPoints.find((c) => c.name === 'CSV CheckPoint 3')).toBeTruthy();
    expect(checkPoints.find((c) => c.name === 'CSV CheckPoint 4')).not.toBeTruthy();

    done();
  });
});
