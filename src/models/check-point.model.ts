import mongoose, {Schema, Document} from 'mongoose';
import {
  AssetSub,
  AssetSubSchema,
  MapSub,
  MapSubSchema,
} from './_sub.model';

export interface CheckPoint extends Document {
    name: string;
    macAddress: string;
    asset?: AssetSub;
    map?: MapSub;
    x?: number;
    y?: number;
}

const CheckPointSchema: Schema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  macAddress: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  asset: {
    type: AssetSubSchema,
  },
  map: {
    type: MapSubSchema,
  },
  x: {
    type: Number,
  },
  y: {
    type: Number,
  },
});

export default mongoose.model<CheckPoint>('CheckPoint', CheckPointSchema);
