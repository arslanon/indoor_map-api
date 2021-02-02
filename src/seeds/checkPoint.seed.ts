
import AssetDoc, {Asset} from '../models/asset.model';
import MapDoc, {Map} from '../models/map.model';
import CheckPointDoc, {CheckPoint} from '../models/check-point.model';
import mapSeed from './map.seed';

/**
 * CheckPoint seed module
 * It seeds map also
 * It seeds asset also
 */
export default async function seed() {
  // it seeds assets also
  await mapSeed();

  const asset1: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
  const asset2: Asset | null = await AssetDoc.findOne({name: 'Asset2'});
  const asset3: Asset | null = await AssetDoc.findOne({name: 'Asset3'});

  const map1: Map | null = await MapDoc.findOne({name: 'Map1'});
  const map2: Map | null = await MapDoc.findOne({name: 'Map2'});
  const map3: Map | null = await MapDoc.findOne({name: 'Map3'});

  await CheckPointDoc.insertMany([
    {name: 'CheckPoint1', macAddress: '112233',
      asset: asset1 || undefined, map: map1 || undefined},
    {name: 'CheckPoint2', macAddress: '445566',
      asset: asset2 || undefined, map: map2 || undefined},
    {name: 'CheckPoint3', macAddress: '778899',
      asset: asset3 || undefined, map: map3 || undefined},
  ]);

  const checkPoints: CheckPoint[] = await CheckPointDoc.find();

  for (const checkPoint of checkPoints) {
    await AssetDoc.findOneAndUpdate(
        {_id: checkPoint.asset?._id},
        {$push: {checkPoints: checkPoint}},
    );
    await MapDoc.findOneAndUpdate(
        {_id: checkPoint.map?._id},
        {$push: {checkPoints: checkPoint}},
    );
  }
}
