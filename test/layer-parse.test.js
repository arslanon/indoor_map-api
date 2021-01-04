
const fs = require('mz/fs');
const { parse } = require('./../src/shared/tile-layers-parser');

const filePath = `images/logo.png`;

describe('Layer parsing', () => {

    it('parse', async (done) => {

        const res = await parse(filePath, 'test')

        expect(res.maxZoom).toBeTruthy();

        console.log(res);

        done();
    });
})