
const mongoose = require("mongoose")

const assetSubSchema = new mongoose.Schema({
    name: {type: String, required: true}
});
const mapSubSchema = new mongoose.Schema({
    name: {type: String, required: true}
});
const checkPointSubSchema = new mongoose.Schema({
    name: {type: String, required: true},
    x: {type: Number, required: true},
    y: {type: Number, required: true}
});

module.exports = {
    assetSubSchema,
    mapSubSchema,
    checkPointSubSchema
}