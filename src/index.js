
const port = process.env.PORT || 3000

require("./shared/mongodb");
const app = require('./web');

const logger = require('./common/logger');
logger.info(`Starting server`, { pid: process.pid });

app.listen(port);