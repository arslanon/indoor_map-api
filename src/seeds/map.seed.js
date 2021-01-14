
const { AssetModel } = require("../models/asset.model");
const { MapModel } = require("../models/map.model");

module.exports = async () => {

    await require('./asset.seed')();

    const asset1 = await AssetModel.findOne({name: 'Asset1'});
    const asset2 = await AssetModel.findOne({name: 'Asset2'});
    const asset3 = await AssetModel.findOne({name: 'Asset3'});

    const maps = [
        {name: 'Map1', asset: asset1, path: '/path1', width: 1921, height: 1081, maxZoom: 11, meterMarkers: []},
        {name: 'Map2', asset: asset2, path: '/path2', width: 1922, height: 1082, maxZoom: 12, meterMarkers: []},
        {name: 'Map3', asset: asset3, path: '/path3', width: 1923, height: 1083, maxZoom: 13, meterMarkers: []}
    ];

    await MapModel.insertMany(maps);

    const mapsInserted = await MapModel.find();

    for(const map of mapsInserted) {
        await AssetModel.findOneAndUpdate(
            {_id: map.asset._id},
            {$push: {maps: map}}
        );
    }
}