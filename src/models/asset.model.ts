import mongoose, {Schema, Document} from 'mongoose';
import {
  CheckPointSub,
  CheckPointSubSchema,
  MapSub,
  MapSubSchema,
} from './_sub.model';

export interface Asset extends Document{
    name: string;
    maps: MapSub[];
    checkPoints: CheckPointSub[];
}

const AssetSchema: Schema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  maps: {
    type: [MapSubSchema],
    default: [],
  },
  checkPoints: {
    type: [CheckPointSubSchema],
    default: [],
  },
});

export default mongoose.model<Asset>('Asset', AssetSchema);
