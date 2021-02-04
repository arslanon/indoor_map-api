import fs from 'fs';
import csv from 'csv-parser';

import AppError from '../common/error/models/app-error.model';

export default async function <T> (
    path: string
): Promise<T[]> {
    let datas: Array<T[]> = [];

    // @ts-ignore
    return new Promise((resolve)=> {
        fs.createReadStream(path)
            .pipe(csv())
            .on('data',async (data)=> {
                datas.push(data)
            })
            .on('end',async ()=> {
                fs.unlinkSync(path)
                if(datas.length) {
                    resolve(datas)
                }
            });
    }).catch((e) => {
        throw new AppError(e, 404, true)
    })
}
