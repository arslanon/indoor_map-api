
import AssetDoc from '../models/asset.model';

/**
 * Asset seed module
 */
export default async function seed() {
  await AssetDoc.insertMany([
    {name: 'Asset1', maps: []},
    {name: 'Asset2', maps: []},
    {name: 'Asset3', maps: []},
  ]);
}
