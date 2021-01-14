const fs = require('fs')
const util = require('util')
const readDir = util.promisify(fs.readdir).bind(fs)
const path = require('path')
const mongoose = require('mongoose')

function toTitleCase (str) {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1)
    })
}

async function seedDatabase (seedModels = []) {
    const dir = await readDir(__dirname)
    const seedFiles = dir.filter(f => f.endsWith('.seed.js'))

    for (const file of seedFiles) {
        const fileName = file.split('.seed.js')[0]
        if (seedModels.includes(fileName)) {

            const modelName = toTitleCase(fileName)
            const model = mongoose.models[modelName]
            if (!model) throw new Error(`Cannot find Model '${modelName}'`)

            await require(path.join(__dirname, file))();
        }
    }
}

module.exports = {
    seedDatabase
}

