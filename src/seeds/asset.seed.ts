
import AssetDoc from '../models/asset.model';

/**
 * Asset seed module
 */
export default async function seed() {
  await AssetDoc.insertMany([
    {name: 'Asset1', maps: [], checkPoints: []},
    {name: 'Asset2', maps: [], checkPoints: []},
    {name: 'Asset3', maps: [], checkPoints: []},
  ]);
}
