const mongoose = require('mongoose');

mongoose.Promise = Promise;
module.exports = mongoose;
mongoose.set('debug', process.env['MONGOOSE_DEBUG'] || false);