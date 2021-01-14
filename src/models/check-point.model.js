
const mongoose = require("mongoose")
const { assetSubSchema, mapSubSchema } = require("./_sub.model")

const CheckPointSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    macAddress: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    asset: {
        type: assetSubSchema,
    },
    map: {
        type: mapSubSchema,
    },
    x: {
        type: Number
    },
    y: {
        type: Number
    }
})

const CheckPointModel = mongoose.model('CheckPoint', CheckPointSchema)

module.exports = {
    CheckPointModel
}