import mongoose, {Schema, Document} from 'mongoose';
import {
  MapSub,
  MapSubSchema,
} from './_sub.model';

export interface CheckPoint extends Document {
    name: string;
    macAddress: string;
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
