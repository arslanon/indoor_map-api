
const { parse } = require('./image-tile.parser');
const fs = require('mz/fs');

describe('Image Tile Parsing', () => {

    it('Parse an image', async (done) => {

        await fs.copyFile(`images/ai.jpg`, `tmp/uploads/ai.jpg`, () => {});

        const res = await parse(`tmp/uploads/ai.jpg`, 'tmp/uploads/ai.jpg');

        expect(res.path).toBeTruthy();
        expect(res.width).toBeTruthy();
        expect(res.height).toBeTruthy();
        expect(res.maxZoom).toBeTruthy();

        // TODO Check folder exists

        // Delete temp file
        await fs.rmdirSync(`uploads/maps/test`, { recursive: true });

        done();
    });
})