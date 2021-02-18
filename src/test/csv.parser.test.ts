import fs from 'fs';
import csvParser from './../shared/csv.parser';
import {CheckPoint} from '../models/check-point.model';

describe('CSV File Parsing', () => {
  it('Parse an csv data', async (done) => {
    expect(fs.existsSync(`files/checkpoints.csv`)).toBeTruthy();
    fs.copyFileSync(`files/checkpoints.csv`, `tmp/uploads/checkpoints.csv`);

    const res = await csvParser<CheckPoint>(`tmp/uploads/checkpoints.csv`);

    expect(res).toHaveLength(3);
    const [first, second, third] = res;
    expect(first!.name).toBeTruthy();
    expect(first!.name).toEqual('CSV CheckPoint 1');
    expect(second!.name).toBeTruthy();
    expect(second!.name).toEqual('CSV CheckPoint 2');
    expect(third!.name).toBeTruthy();
    expect(third!.name).toEqual('CSV CheckPoint 3');

    // Delete temp file
    await fs.rmdirSync(`tmp/uploads/checkpoints.csv`, {recursive: true});

    done();
  });
});
