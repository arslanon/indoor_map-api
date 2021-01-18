
const { parse } = require('./csv.parser');
const fs = require('mz/fs');

describe('CSV File Parsing', () => {

    it('Parse an csv data', async (done) => {

        await fs.copyFile(`files/demo.csv`, `tmp/uploads/demo.csv`, () => {});

        const res = await parse(`tmp/uploads/demo.csv`)

        expect(res.name).toBeTruthy;
        expect(res.macAddress).toBeTruthy;

        // TODO Check folder exists

        // Delete temp file
        await fs.rmdirSync(`tmp/uploads/demo.csv`, { recursive: true });

        done();
    });
})