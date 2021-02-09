import fs from 'fs';
import csvParser from './csv.parser';
import {CheckPoint} from "../models/check-point.model";

describe('CSV File Parsing', () => {

    it('Parse an csv data', async (done) => {

        expect(fs.existsSync(`files/checkpoints.csv`)).toBeTruthy();
        await fs.copyFile(`files/checkpoints.csv`, `tmp/uploads/checkpoints.csv`, () => {});
        const res = await csvParser<CheckPoint>(`tmp/uploads/checkpoints.csv`)

        expect(res).toHaveLength(3);
        const [first, second, third] = res;
        expect(first!.name).toBeTruthy();
        expect(second!.name).toEqual("New ozgun 2");
        expect(second!.name).toBeTruthy();
        expect(third!.name).toEqual("New ozgun 3");
        expect(third!.name).toBeTruthy();

        // Delete temp file
        await fs.rmdirSync(`tmp/uploads/checkpoints.csv`, { recursive: true });

        done();
    });
})
