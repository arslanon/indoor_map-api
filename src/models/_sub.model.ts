
import {Schema, Document} from 'mongoose';

export interface AssetSub extends Document {
    name: string;
}

export interface MapSub extends Document {
    name: string;
}

export interface CheckPointSub extends Document {
    name: string;
    x?: number;
    y?: number;
}

const AssetSubSchema: Schema = new Schema({
  name: {type: String, required: true},
});

const MapSubSchema: Schema = new Schema({
  name: {type: String, required: true},
});

const CheckPointSubSchema: Schema = new Schema({
  name: {type: String, required: true},
  x: {type: Number, required: true},
  y: {type: Number, required: true},
});

export {
  AssetSubSchema,
  MapSubSchema,
  CheckPointSubSchema,
};
