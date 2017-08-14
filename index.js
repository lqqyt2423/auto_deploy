'use strict';

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const config = require('./config');
const api = require('./api');

const app = express();

app.use(morgan('dev'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use('/auto_deploy', api);

app.use('/auto_deploy', express.static('client/dist'));

app.listen(config.port);
