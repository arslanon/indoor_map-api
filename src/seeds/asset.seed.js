
const { AssetModel } = require("../models/asset.model");

module.exports = async () => {
    const assets = [
        {name: 'Asset1'},
        {name: 'Asset2'},
        {name: 'Asset3'}
    ];

    await AssetModel.insertMany(assets)
}

