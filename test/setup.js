const mongoose = require('mongoose');
const config = require('../src/config');
const assert = require('assert');

const cleanDatabase = function cleanDatabase(done){
    mongoose.connection.dropDatabase(function (err) {
        if(err) return done(err);
        done();
    });
};

before(function(done){
    assert(config.env === 'test', 'You are trying to run the test with NODE_ENV set to ' + config.env +
        '! Process aborted to prevent potential data loss. Set NODE_ENV to "test" and ' +
        'make sure you have an appropriate mongodb uri set up in the config file for test configuration.');

    mongoose.Promise = Promise;
    mongoose.connect(config.mongo.uri, {}, function(error){
        if(error) return done(error);
        cleanDatabase(done);
    });
});

after(function(done){
    cleanDatabase(done);
});