
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

  const map1: Map | null = await MapDoc.findOne({name: 'Map1'});
  const map2: Map | null = await MapDoc.findOne({name: 'Map2'});
  const map3: Map | null = await MapDoc.findOne({name: 'Map3'});

  await CheckPointDoc.insertMany([
    {name: 'CheckPoint1', macAddress: '112233', map: map1 || undefined},
    {name: 'CheckPoint2', macAddress: '445566', map: map2 || undefined},
    {name: 'CheckPoint3', macAddress: '778899', map: map3 || undefined},
  ]);

  const checkPoints: CheckPoint[] = await CheckPointDoc.find();

  for (const checkPoint of checkPoints) {
    await MapDoc.findOneAndUpdate(
        {_id: checkPoint.map?._id},
        {$push: {checkPoints: checkPoint}},
    );
  }
}
