
const mongoose = require("mongoose");
const { assetSubSchema, checkPointSubSchema } = require("./_sub.model");

const MapSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    asset: {
        type: assetSubSchema,
    },
    path: {
        type: String,
        trim: true
    },
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    maxZoom: {
        type: Number
    },
    checkPoints: {
        type: [checkPointSubSchema],
        default: []
    }
})

const MapModel = mongoose.model('Map', MapSchema);

module.exports = {
    MapModel
}