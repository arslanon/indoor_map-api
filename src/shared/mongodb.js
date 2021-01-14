
const mongoose = require("mongoose")

const url = process.env.MONGO_URL || "mongodb://localhost/indoorMap"
const username = process.env.MONGO_USERNAME || "onura";
const password = process.env.MONGO_PASSWORD || "test";

mongoose.connect(url, {
    user: username,
    pass: password,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, () => {
    // console.log("MongoDB connection is success!!")
})
