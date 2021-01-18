const fs = require('fs');
const csv = require('csv-parser')

const { AppError } = require("../common/error");

module.exports = {
    parse: async (path) => {

        let datas = []
        return new Promise((resolve)=> {
            fs.createReadStream(path)
                .pipe(csv())
                .on('data',async (data)=> {
                    datas.push(data)
                })
                .on('end',async ()=> {
                    fs.unlinkSync(path)
                    if(datas.length) {
                        resolve(datas)
                    }
                });
        }).catch((e) => {
            throw new AppError(e, 404, true)
        })
    }
}