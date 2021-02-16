/* eslint-disable max-len */
import setupTestDatabase from '../shared/db-test-setup';
import MapDoc, {Map} from '../models/map.model';
import CheckPointDoc, {CheckPoint} from '../models/check-point.model';
import supertest, {Response} from 'supertest';
import app from '../app';

const request = supertest(app);

describe('Map CheckPoint API', () => {
  setupTestDatabase('indoorMap-testDb-map', ['checkPoint']);

  jest.setTimeout(50000);

  it('GET /api/map/:id/checkPoint - get a map checkPoints', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});

    const res: Response = await request
        .get(`/api/map/${map!._id}/checkPoint`);

    expect(res.status).toBe(200);
    const checkPoints: CheckPoint[] = res.body;

    expect(checkPoints).toHaveLength(1);
    expect(checkPoints.find((c) => c.name === 'CheckPoint1')).toBeTruthy();

    done();
  });

  it('PUT /api/map/:id/checkPoint - update a map checkPoint position', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const res: Response = await request
        .put(`/api/map/${map!._id}/checkPoint/${checkPoint!._id}/position`)
        .send({
          x: 1001,
          y: 901
        });

    expect(res.status).toBe(200);
    const checkPointUpdated: CheckPoint = res.body;

    expect(checkPointUpdated).toBeTruthy();
    expect(checkPointUpdated!._id).toBeTruthy();
    expect(checkPointUpdated!.name).toBeTruthy();
    expect(checkPointUpdated!.macAddress).toBeTruthy();
    expect(checkPointUpdated!.map).toBeTruthy();
    expect(checkPointUpdated!.x).toStrictEqual(1001);
    expect(checkPointUpdated!.y).toStrictEqual(901);

    done();
  });

  it('PUT /api/map/:id/checkPoint - update a map checkPoint that not include specified map', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint2'});
    expect(checkPoint).toBeTruthy();

    const res: Response = await request
        .put(`/api/map/${map!._id}/checkPoint/${checkPoint!._id}/position`)
        .send({
          x: 1001,
          y: 901
        });

    expect(res.status).toBe(404);

    done();
  });

  it('PUT /api/map/:id/checkPoint - update a map checkPoint with non fit positions', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const checkPoint: CheckPoint | null = await CheckPointDoc.findOne({name: 'CheckPoint1'});
    expect(checkPoint).toBeTruthy();

    const res: Response = await request
        .put(`/api/map/${map!._id}/checkPoint/${checkPoint!._id}/position`)
        .send({
          x: 544359,
          y: 542345
        });

    expect(res.status).toBe(422);

    done();
  });
});
