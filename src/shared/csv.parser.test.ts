import fs from 'fs';
import csvParser from './csv.parser';

describe('CSV File Parsing', () => {

    it('Parse an csv data', async (done) => {

        await fs.copyFile(`files/demo.csv`, `tmp/uploads/demo.csv`, () => {});

        // @ts-ignore
        const res = await csvParser(`tmp/uploads/demo.csv`)

        expect(res.name).toBeTruthy;
        expect(res.macAddress).toBeTruthy;
        // TODO Check folder exists

        // Delete temp file
        await fs.rmdirSync(`tmp/uploads/demo.csv`, { recursive: true });

        done();
    });
})
