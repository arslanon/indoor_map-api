
const { AssetModel } = require("../models/asset.model");
const { MapModel } = require("../models/map.model");
const { CheckPointModel } = require("../models/check-point.model");

module.exports = async () => {

    // it seeds assets also
    await require('./map.seed')();

    const asset1 = await AssetModel.findOne({name: 'Asset1'});
    const asset2 = await AssetModel.findOne({name: 'Asset2'});
    const asset3 = await AssetModel.findOne({name: 'Asset3'});

    const map1 = await MapModel.findOne({name: 'Map1'});
    const map2 = await MapModel.findOne({name: 'Map2'});
    const map3 = await MapModel.findOne({name: 'Map3'});

    const checkPoints = [
        {name: 'CheckPoint1', macAddress: '112233', asset: asset1, map: map1},
        {name: 'CheckPoint2', macAddress: '445566', asset: asset2, map: map2},
        {name: 'CheckPoint3', macAddress: '778899', asset: asset3, map: map3}
    ];

    await CheckPointModel.insertMany(checkPoints);

    const checkPointsInserted = await CheckPointModel.find();

    for(const checkPoint of checkPointsInserted) {
        await AssetModel.findOneAndUpdate(
            {_id: checkPoint.asset._id},
            {$push: {checkPoints: checkPoint}}
        );
        await MapModel.findOneAndUpdate(
            {_id: checkPoint.map._id},
            {$push: {checkPoints: checkPoint}}
        );
    }
}