
const supertest = require('supertest');
const fs = require('mz/fs');
const app = require('../src/app');
const request = supertest(app);

describe('Map CRUD / Image Overlay Parsing', () => {

    jest.setTimeout(50000)

    it('POST /api/map - create map and parse image for ai.jpg', async (done) => {

        const filePath = `images/ai.jpg`;

        if(! (await fs.exists(filePath))) throw new Error('file does not exists!');

        request
            .post('/api/map')
            .attach('image', filePath)
            .field('name', 'ai')
            .field('assetId', '1')
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.assetId).toBeTruthy()
                expect(res.body.name).toBeTruthy()
                expect(res.body.path).toBeTruthy()
                expect(res.body.width).toBeTruthy()
                expect(res.body.height).toBeTruthy()
                expect(res.body.maxZoom).toBeTruthy()
            })
            .end((err, res) => {
                console.log(res.body);
                return err ? done(err) : done();
            });
    });

    it('POST /api/map - create map and parse image for frog.png', async (done) => {

        const filePath = `images/frog.png`;

        if(! (await fs.exists(filePath))) throw new Error('file does not exists!');

        request
            .post('/api/map')
            .attach('image', filePath)
            .field('name', 'frog')
            .field('assetId', '1')
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.assetId).toBeTruthy()
                expect(res.body.name).toBeTruthy()
                expect(res.body.path).toBeTruthy()
                expect(res.body.width).toBeTruthy()
                expect(res.body.height).toBeTruthy()
                expect(res.body.maxZoom).toBeTruthy()
            })
            .end((err, res) => {
                console.log(res.body);
                return err ? done(err) : done();
            });
    });

    it('POST /api/map - create map and parse image for telcoset.jpg', async (done) => {

        const filePath = `images/telcoset.jpg`;

        if(! (await fs.exists(filePath))) throw new Error('file does not exists!');

        request
            .post('/api/map')
            .attach('image', filePath)
            .field('name', 'telcoset')
            .field('assetId', '2')
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.assetId).toBeTruthy()
                expect(res.body.name).toBeTruthy()
                expect(res.body.path).toBeTruthy()
                expect(res.body.width).toBeTruthy()
                expect(res.body.height).toBeTruthy()
                expect(res.body.maxZoom).toBeTruthy()
            })
            .end((err, res) => {
                console.log(res.body);
                return err ? done(err) : done();
            });
    });

    it('POST /api/map - create map and parse image for logo.png', async (done) => {

        const filePath = `images/logo.png`;

        if(! (await fs.exists(filePath))) throw new Error('file does not exists!');

        request
            .post('/api/map')
            .attach('image', filePath)
            .field('name', 'logo')
            .field('assetId', '2')
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.assetId).toBeTruthy()
                expect(res.body.name).toBeTruthy()
                expect(res.body.path).toBeTruthy()
                expect(res.body.width).toBeTruthy()
                expect(res.body.height).toBeTruthy()
                expect(res.body.maxZoom).toBeTruthy()
            })
            .end((err, res) => {
                console.log(res.body);
                return err ? done(err) : done();
            });
    });

    it('GET /api/map and /api/map/:id - get map with id', async (done) => {
        const maps = await request.get('/api/map');

        expect(maps.status).toBe(200);
        expect(maps.body.length).toBeGreaterThan(0);

        request
            .get(`/api/map/${maps.body[0].id}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBeTruthy()
            })
            .end(done)

    });
})