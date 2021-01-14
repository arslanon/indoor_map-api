
const mongoose = require("mongoose")
const { mapSubSchema, checkPointSubSchema } = require("./_sub.model")

const AssetSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    maps: {
        type: [mapSubSchema],
        default: []
    },
    checkPoints: {
        type: [checkPointSubSchema],
        default: []
    }
});

const AssetModel = mongoose.model('Asset', AssetSchema)

module.exports = {
    AssetModel
}