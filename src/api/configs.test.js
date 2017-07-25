const express = require('../services/express');
const setup = require('../../test/setup');
const appConfig = require('../config');
const request = require('supertest');
const routes = require('./configs');
const mongoose = require('../services/mongoose');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const merge = require('merge');
const querystring = require('querystring');
const url = require('url');
const configModel = require('../models/config');
const errors = require('../errors');

var app;
var Config;

const game = 'test';

var testUserCanReadConfigs = {
    id: 1234567,
    roles: [{role: 'readConfigs', game: game }]
};

var testUserCanWriteConfigs = {
    id: 1234568,
    roles: [{role: 'writeConfigs', game: game }]
};

var testUserCanReadWriteConfigs = {
    id: 1234568,
    roles: [{role: 'readWriteConfigs', game: game }]
};

var testUserCanReadData = {
    id: 1234569,
    roles: [{role: 'readData', game: game }]
};

var configModels;

beforeEach(function(done) {
    app = express({path: '/', router: routes(mongoose.connection, game)});
    Config = configModel.createConfigModel(mongoose.connection);

    var fruits = ["apple", "banana", "pear", "peach", "grape", "orange", "pineapple"]; // I am hungry, ok?!
    var configs = [];
    for(var i=0; i<10; i++) {
        var cfg = {
            name: "TestConfig"+i,
            configVersion: 1,
            gameVersion: 1,
            data: {
                someNumber: i,
                fruit: fruits[Math.floor(Math.random()*fruits.length)]
            }
        };
        configs.push(cfg);
    }
    Config.create(configs, function (err, cfgs) {
        if (err) return done(err);
        configModels = cfgs;
        done();
    });
});

afterEach(function(done){
    Config.remove({}, done);
});

describe('/configs', function(){
    describe('GET /:configId', function() {
        it('responds with 401 Unauthorized when there is no access token', function(done){
            var config = configModels[0];
            request(app)
                .get('/'+config._id)
                .expect(401, done);
        });

        // These tests were temporary removed since any user can read config now
        /*
        it('responds with 401 Unauthorized when user does not have readConfigs role', function(done){
            var accessToken = jwt.sign({user: testUserCanReadData}, appConfig.jwtSecret);
            var config = configModels[0];
            request(app)
                .get('/'+config._id)
                .set('Authorization', "Bearer " + accessToken)
                .expect(401, done);
        });

        it('responds with 401 Unauthorized when user can write configs but cant read them (unrealistic scenario but still)', function(done){
            var accessToken = jwt.sign({user: testUserCanWriteConfigs}, appConfig.jwtSecret);
            var config = configModels[0];
            request(app)
                .get('/'+config._id)
                .set('Authorization', "Bearer " + accessToken)
                .expect(401, done);
        });
         */

        it('responds with 200 OK and returns one config - user with readConfigs role', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            var config = configModels[0];
            request(app)
                .get('/'+config._id)
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert(res.body.config);
                    assert.deepEqual(res.body.config.data, config.data, "config data doesn't match");
                    done();
                });
        });

        it('responds with 200 OK and returns one config - user with readWriteConfigs roles', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadWriteConfigs}, appConfig.jwtSecret);
            var config = configModels[0];
            request(app)
                .get('/'+config._id)
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert(res.body.config);
                    assert.deepEqual(res.body.config.data, config.data, "config data doesn't match");
                    done();
                });
        });
    });

    describe('GET /', function(){
        it('responds with 401 Unauthorized when there is no access token', function(done){
            request(app)
                .get('/')
                .expect(401, done);
        });

        // These tests were temporary removed since any user can read config now
        /*
        it('responds with 401 Unauthorized when user does not have access to readConfigs', function(done){
            var accessToken = jwt.sign({user: testUserCanReadData}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .set('Authorization', "Bearer " + accessToken)
                .expect(401, done);
        });
        */

        it('/ - responds with 200 OK and returns the list of configs', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert.equal(res.body.configs.length, configModels.length);
                    done();
                });
        });

        it('?sort=data.someNumber - responds with 200 OK and returns the list of sorted configs', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .query({ sort: "data.someNumber" })
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert(res.body.configs.length, configModels.length);
                    for(var i=0; i<configModels.length; i++) // Configs are sorted by time by default
                        assert.equal(res.body.configs[i].data.someNumber, configModels[i].data.someNumber, "config data.someNumber doesn't match");
                    done();
                });
        });

        it('?sort=+data.someNumber - responds with 200 OK and returns the list of sorted configs', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .query({ sort: "+data.someNumber" })
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert(res.body.configs.length, configModels.length);
                    for(var i=0; i<configModels.length; i++) // Configs are sorted by time by default
                        assert.equal(res.body.configs[i].data.someNumber, configModels[i].data.someNumber, "config data.someNumber doesn't match");
                    done();
                });
        });

        it('?sort={"data.someNumber": -1} - responds with 200 OK and returns the list of sorted configs', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .query({ sort: JSON.stringify({"data.someNumber": -1}) })
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert(res.body.configs.length, configModels.length);
                    for(var i=0; i<configModels.length; i++)
                        assert.equal(res.body.configs[i].data.someNumber, configModels[configModels.length - 1 - i].data.someNumber, "config data.someNumber doesn't match");
                    done();
                });
        });

        it('?sort={"data.fruit": 1} - responds with 200 OK and returns the list of sorted configs', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .query({ sort: JSON.stringify({"data.fruit": "asc"}) })
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert(res.body.configs.length, configModels.length);
                    var previousFruit = null;
                    for(var i=0; i<res.body.configs.length; i++) { // Configs are sorted by time by default
                        if(previousFruit !== null)
                            assert(res.body.configs[i].data.fruit >= previousFruit, "config list is not sorted");
                        previousFruit = res.body.configs[i].data.fruit;
                    }
                    done();
                });
        });

        it('?name=TestConfig1 - responds with 200 OK and returns the list of filtered configs', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .query({ query: JSON.stringify({ name: "TestConfig1" }) })
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert.equal(res.body.configs.length, 1, "More than 1 config with name TestConfig1 was found");
                    assert.equal(res.body.configs[0].name, "TestConfig1", "config name is not TestConfig1 after filtering");
                    done();
                });
        });

        it('?limit=5 - responds with 200 OK and returns the list of configs', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .query({ limit: 5 })
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert.equal(res.body.configs.length, 5, "length of res.body.configs is incorrect");
                    done();
                });
        });

        it('?skip=5 - responds with 200 OK and returns the list of configs', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .query({ skip: 5})
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert.equal(res.body.configs.length, 5, "length of res.body.configs is incorrect");
                    done();
                });
        });

        it('?limit=2&skip=2&sort=+data.someNumber&&query={ "data.someNumber": { "$gte": 5 } } - responds with 200 OK and returns the list of configs', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .query({limit:2, skip:2, sort: "+data.someNumber", query: JSON.stringify({"data.someNumber": { "$gte": 5 }})})
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert.equal(res.body.configs.length, 2, "length of res.body.configs is incorrect");
                    assert.equal(res.body.configs[0].data.someNumber, 7, "first config has incorrect data.someNumber");
                    assert.equal(res.body.configs[1].data.someNumber, 8, "second config has incorrect data.someNumber");
                    done();
                });
        });

        it('/?limit=5 - responds with 200 OK and returns valid meta object with total count', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert.equal(res.body.meta.total, configModels.length);
                    done();
                });
        });

        it('/ - responds with 200 OK and returns valid links object (no links)', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert.equal(res.body.links.pages.prev, undefined);
                    assert.equal(res.body.links.pages.next, undefined);
                    assert.equal(res.body.links.pages.last, undefined);
                    done();
                });
        });

        it('/?limit=2&skip=4 - responds with 200 OK and returns valid links object', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .query({limit:2, skip:4})
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert.equal(parseInt(querystring.parse(url.parse(res.body.links.pages.prev).query).skip), 2);
                    assert.equal(parseInt(querystring.parse(url.parse(res.body.links.pages.next).query).skip), 6);
                    assert.equal(parseInt(querystring.parse(url.parse(res.body.links.pages.last).query).skip), 8);
                    done();
                });
        });

        it('/?limit=2&skip=8 - responds with 200 OK and returns valid links object (no last page)', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            request(app)
                .get('/')
                .query({limit:2, skip:8})
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert.equal(parseInt(querystring.parse(url.parse(res.body.links.pages.prev).query).skip), 6);
                    assert.equal(res.body.links.pages.next, undefined);
                    assert.equal(parseInt(querystring.parse(url.parse(res.body.links.pages.last).query).skip), 8);
                    done();
                });
        });
    });

    describe('POST /', function(){
        it('responds with 401 Unauthorized when user cant write configs', function(done){
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            var config = configModels[0];
            request(app)
                .post('/')
                .set('Authorization', "Bearer " + accessToken)
                .expect(401, done);
        });

        it('fails to post a config where name is already taken', function(done) {
            var accessToken = jwt.sign({user: testUserCanWriteConfigs}, appConfig.jwtSecret);
            var config = {name: "TestConfig1", gameVersion:1, configVersion:1, data: {"test": 123} };
            request(app)
                .post('/')
                .send(config)
                .set('Authorization', "Bearer " + accessToken)
                .expect(409) // Conflict error - config name already taken
                .end(function(err, res){
                    assert.equal(res.body.error.name, "ConfigNameTakenError", "conflict error name is invalid");
                    done();
                });
        });

        it('posts new config', function(done) {
            var accessToken = jwt.sign({user: testUserCanWriteConfigs}, appConfig.jwtSecret);
            var config = {name: "NewTestConfig", gameVersion:1, configVersion:1, data: {"test": 123} };
            request(app)
                .post('/')
                .send(config)
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert(res.body.config.id, "no config id returned");
                    Config.findOne({name: config.name}).exec()
                        .then(function(cfg){
                            assert(cfg, "no config found in the database after posting it");
                            assert.equal(cfg._id, res.body.config.id, "config id in the database doesn't match one in the http response");
                            done();
                        })
                        .catch(done);
                });
        });
    });
    describe('PUT /:configId', function(){
        it('responds with 401 Unauthorized when user cant write configs', function(done){
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            var config = configModels[0];
            request(app)
                .put('/'+config._id)
                .send(config)
                .set('Authorization', "Bearer " + accessToken)
                .expect(401, done);
        });

        it('fails to update a config where name is already taken', function(done) {
            var accessToken = jwt.sign({user: testUserCanWriteConfigs}, appConfig.jwtSecret);
            var config = {name: "TestConfig1", gameVersion:1, configVersion:1, data: {"test": 123} };
            request(app)
                .post('/')
                .send(config)
                .set('Authorization', "Bearer " + accessToken)
                .expect(409) // Conflict error - config name already taken
                .end(function(err, res){
                    assert.equal(res.body.error.name, "ConfigNameTakenError", "conflict error name is invalid");
                    done();
                });
        });

        it('updates existing config', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadWriteConfigs}, appConfig.jwtSecret);
            var config = configModels[0];
            config.data.someNumber = 123;
            request(app)
                .put('/'+config._id)
                .send(config)
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    assert(res.body.config.id, "no config id returned");
                    Config.findOne({name: config.name}).exec()
                        .then(function(cfg){
                            assert(cfg, "no config found in the database after posting it");
                            assert.equal(cfg.id, res.body.config.id, "config id in the database doesn't match one in the http response");
                            assert.equal(cfg.data.someNumber, config.data.someNumber, "cfg.data.someNumber is invalid");
                            done();
                        })
                        .catch(done);
                });
        });
    });
    describe('DELETE /:configId', function(){
        it('responds with 401 Unauthorized when user cant write configs', function(done){
            var accessToken = jwt.sign({user: testUserCanReadConfigs}, appConfig.jwtSecret);
            var config = configModels[0];
            request(app)
                .put('/'+config._id)
                .send(config)
                .set('Authorization', "Bearer " + accessToken)
                .expect(401, done);
        });

        it('deletes existing config', function(done) {
            var accessToken = jwt.sign({user: testUserCanReadWriteConfigs}, appConfig.jwtSecret);
            var config = configModels[0];
            request(app)
                .delete('/'+config._id)
                .set('Authorization', "Bearer " + accessToken)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    Config.findById(config._id).exec()
                        .then(function(cfg){
                            assert(!cfg, "config was found in the database after deleting");
                            done();
                        })
                        .catch(done);
                });
        });
    });
});