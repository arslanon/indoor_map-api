/* eslint-disable max-len */
import supertest, {Response} from 'supertest';
import app from '../app';
import fs from 'mz/fs';
import setupTestDatabase from '../shared/db-test-setup';
import MapDoc, {Map} from '../models/map.model';
import CheckPointDoc, {CheckPoint} from '../models/check-point.model';

const request = supertest(app);

describe('CheckPoint CRUD API', () => {
  setupTestDatabase('indoorMap-testDb-checkPoint', ['checkPoint']);

  jest.setTimeout(50000);

  it('GET /api/checkPoint - get all checkPoints', async (done) => {
    const res: Response = await request
        .get('/api/checkPoint')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);

    done();
  });

  it('GET /api/checkPoint/:id - get a checkPoint', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const res: Response = await request
        .get(`/api/checkPoint/${checkPoint!._id}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body._id).toBeTruthy();
    expect(res.body.name).toStrictEqual('CheckPoint1');

    done();
  });

  it('POST /api/checkPoint/csv - create checkPoints via CSV', async (done) => {
    const filePath = `files/checkpoints.csv`;
    if (! (await fs.exists(filePath))) throw new Error('file does not exists!');

    const res: Response = await request
        .post('/api/checkPoint/csv')
        .set('Accept', 'application/json')
        .attach('csv', filePath);

    expect(res.status).toBe(200);
    const checkPoints: CheckPoint[] = res.body;

    expect(checkPoints).toBeTruthy();
    expect(checkPoints).toHaveLength(3);
    expect(checkPoints.find((c) => c.name === 'CSV CheckPoint 1')).toBeTruthy();
    expect(checkPoints.find((c) => c.name === 'CSV CheckPoint 2')).toBeTruthy();
    expect(checkPoints.find((c) => c.name === 'CSV CheckPoint 3')).toBeTruthy();
    expect(checkPoints.find((c) => c.name === 'CSV CheckPoint 4')).not.toBeTruthy();

    done();
  });

  // noinspection DuplicatedCode
  it('POST /api/checkPoint/:id/map - set a checkPoint map', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(map).toBeTruthy();

    const res: Response = await request
        .post(`/api/checkPoint/${checkPoint!._id}/map`)
        .send({
          mapId: map!._id,
          x: 531,
          y: 432
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    const checkPointSet: CheckPoint = res.body;

    expect(checkPointSet).toBeTruthy();
    expect(checkPointSet._id).toBeTruthy();
    expect(checkPointSet.name).toStrictEqual(checkPoint!.name);
    expect(checkPointSet.map).toBeTruthy();
    expect(checkPointSet.map!.name).toStrictEqual(map!.name);
    expect(checkPointSet.x).toStrictEqual(531);
    expect(checkPointSet.y).toStrictEqual(432);

    const mapOld: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapOld).toBeTruthy();
    expect(mapOld!.checkPoints.filter((c) => c.name === checkPointSet!.name)).toHaveLength(0);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPointSet!.name)).toHaveLength(1);

    done();
  });

  // noinspection DuplicatedCode
  it('POST /api/checkPoint/:id/unmap - unset a checkPoint map', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    // Set map
    const res1: Response = await request
        .post(`/api/checkPoint/${checkPoint!._id}/map`)
        .send({
          mapId: map!._id,
          x: 531,
          y: 432
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res1.status).toBe(200);
    const checkPointSet1: CheckPoint = res1.body;

    expect(checkPointSet1).toBeTruthy();
    expect(checkPointSet1._id).toBeTruthy();
    expect(checkPointSet1.name).toStrictEqual(checkPoint!.name);
    expect(checkPointSet1.map).toBeTruthy();
    expect(checkPointSet1.map!.name).toStrictEqual(map!.name);
    expect(checkPointSet1.x).toStrictEqual(531);
    expect(checkPointSet1.y).toStrictEqual(432);

    // Unset map
    const res: Response = await request
        .post(`/api/checkPoint/${checkPoint!._id}/unmap`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    const checkPointSet2: CheckPoint = res.body;

    expect(checkPointSet2).toBeTruthy();
    expect(checkPointSet2._id).toBeTruthy();
    expect(checkPointSet2.name).toStrictEqual(checkPoint!.name);
    expect(checkPointSet2.map).not.toBeTruthy();
    expect(checkPointSet2.x).not.toBeTruthy();
    expect(checkPointSet2.y).not.toBeTruthy();

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.checkPoints.filter((c) => c.name === checkPointSet2!.name)).toHaveLength(0);

    done();
  });

  it('PUT /api/checkPoint/:id - update a checkPoint position', async (done) => {
    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const res: Response = await request
        .put(`/api/checkPoint/${checkPoint!._id}/position`)
        .send({x: 531, y: 432})
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    const checkPointUpdated: CheckPoint = res.body;

    expect(checkPointUpdated).toBeTruthy();
    expect(checkPointUpdated._id).toBeTruthy();
    expect(checkPointUpdated.x).toStrictEqual(531);
    expect(checkPointUpdated.y).toStrictEqual(432);

    done();
  });
});
