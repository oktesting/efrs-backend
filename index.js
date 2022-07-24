const winston = require('winston');
const express = require('express');
require('dotenv').config();

const app = express();

require('./startup/logging')();
require('./startup/cors')(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/validation')();
require('./startup/prod')(app);

const port = process.env.PORT || 3900;
const server = app.listen(port, () => {
  winston.info(`listening on the port ${port}`);
});
module.exports = server; //export server for testing
