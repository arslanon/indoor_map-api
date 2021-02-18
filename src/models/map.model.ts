import mongoose, {Schema, Document} from 'mongoose';
import {
  AssetSub,
  AssetSubSchema,
  CheckPointSub,
  CheckPointSubSchema,
} from './_sub.model';

export interface Map extends Document {
    name: string;
    asset?: AssetSub;
    path?: string;
    width?: number;
    height?: number;
    maxZoom?: number;
    ratio?: number;
    checkPoints: CheckPointSub[];
}

const MapSchema: Schema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  asset: {
    type: AssetSubSchema,
  },
  path: {
    type: String,
    trim: true,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  maxZoom: {
    type: Number,
  },
  ratio: {
    type: Number,
  },
  checkPoints: {
    type: [CheckPointSubSchema],
    default: [],
  },
});

export default mongoose.model<Map>('Map', MapSchema);
