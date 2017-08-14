'use strict';

const mongoose = require('mongoose');
const config = require('../config');

mongoose.set('debug', true);

mongoose.connect(config.database.mongodb.db, {
  useMongoClient: true
});

mongoose.Promise = global.Promise;
