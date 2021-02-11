import fs from 'fs';
import csv from 'csv-parser';
import AppError from '../common/error/models/app-error.model';

/**
 * Parses an csv file and return row of objects type T
 * @param {string} path
 * @return {Promise<[]>}
 */
export default async function <T>(
    path: string
): Promise<T[]> {
  const documents: T[] = [];

  return new Promise<T[]>((resolve) => {
    fs.createReadStream(path)
        .pipe(csv())
        .on('data', async (row)=> {
          documents.push(row as T);
        })
        .on('end', async ()=> {
          fs.unlinkSync(path);
          resolve(documents);
        });
  }).catch((e) => {
    throw new AppError(e, 404, true);
  });
}
