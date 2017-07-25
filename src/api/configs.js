const express = require('express');
const passportService = require('../services/passport');
const paginateService = require('../services/paginate');
const sortParserService = require('../services/sortparser');
const queryParserService = require('../services/queryparser');
const mongoose = require('../services/mongoose');
const configModel = require('../models/config');
const errors = require('../errors');
const merge = require('merge');
const config = require('../config');

const ConfigNameTakenError = function ConfigNameTakenError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};
require('util').inherits(ConfigNameTakenError, errors.ConflictError);


module.exports = function(connection, game) {
    game = game || null;
    const Config = configModel.createConfigModel(connection);
    const router = new express.Router();

    router
        .get('/', passportService.authenticate(), function (req, res, next) {

            // For now, let's pretend anyone can read configs. Uncomment when you want to limit people who can do that
            //if(!req.user.can({role: "readConfigs", game: game}))
            //    return next(new errors.AuthorizationError("You have no access to this resource"));

            var query = queryParserService.fromQueryOrBody("query", req);

            var skip = parseInt(req.query.skip) || 0;
            var limit = parseInt(req.query.limit) || 0;
            var sort = req.query.sort ? sortParserService.parse(req.query.sort) : {time: "asc"};
            var configs;
            Config.find(query).sort(sort).limit(limit).skip(skip).exec()
                .then(function (cfgs) {
                    configs = cfgs;
                    return Config.count(query).exec();
                })
                .then(function (totalCount) {
                    res.json({
                        configs: configs.map(function(cfg){ return cfg.toObject() }),
                        meta: {
                            total: totalCount
                        },
                        links: {
                            pages: paginateService.getPageLinks(skip, limit, totalCount, req.url)
                        }
                    });
                })
                .catch(next);
        })

        .get('/:configId', passportService.authenticate(), function (req, res, next) {

            // For now, let's pretend anyone can read configs. Uncomment when you want to limit people who can do that
            //if(!req.user.can({role: "readConfigs", game: game}))
            //    return next(new errors.AuthorizationError("You have no access to this resource"));

            if(!req.params.configId)
                return next(new errors.InvalidQueryError("Invalid configId"));

            var configId = String(req.params.configId);
            Config.findById(configId)
                .then(function (config) {
                    res.json({
                        config: config
                    });
                })
                .catch(next);
        })

        .post('/', passportService.authenticate(), function (req, res, next) {
            if(!req.user.can({role: "writeConfigs", game: game}))
                return next(new errors.AuthorizationError("You have no access to this resource"));

            if(!req.body.name)
                return next(new errors.InvalidQueryError("Invalid name"));
            if(!req.body.data)
                return next(new errors.InvalidQueryError("Invalid data"));
            if(!req.body.configVersion)
                return next(new errors.InvalidQueryError("Invalid configVersion"));
            if(!req.body.gameVersion)
                return next(new errors.InvalidQueryError("Invalid gameVersion"));

            var name = String(req.body.name);
            var data = req.body.data;
            var configVersion = String(req.body.configVersion);
            var gameVersion = String(req.body.gameVersion);
            var configServerVersion = config.configServerVersion;

            Config.findOne({name: name}).exec()
                .then(function(config){
                    if(config)
                        throw new ConfigNameTakenError("Config name is already taken");

                    Config.create({name: name, data: data, configVersion: configVersion, gameVersion: gameVersion, configServerVersion: configServerVersion}, function(err, config){
                        if(err) return next(err);
                        res.json({config: config.toObject()});
                    });
                })
                .catch(next);
        })

        .put('/:configId', passportService.authenticate(), function (req, res, next) {
            if(!req.user.can({role: "writeConfigs", game: game}))
                return next(new errors.AuthorizationError("You have no access to this resource"));

            if(!req.params.configId)
                return next(new errors.InvalidQueryError("Invalid configId"));

            if(!req.body.name)
                return next(new errors.InvalidQueryError("Invalid name"));
            if(!req.body.data)
                return next(new errors.InvalidQueryError("Invalid data"));
            if(!req.body.configVersion)
                return next(new errors.InvalidQueryError("Invalid configVersion"));
            if(!req.body.gameVersion)
                return next(new errors.InvalidQueryError("Invalid gameVersion"));

            var configId = String(req.params.configId);
            var name = String(req.body.name);
            var data = req.body.data;
            var configVersion = String(req.body.configVersion);
            var gameVersion = String(req.body.gameVersion);
            var configServerVersion = config.configServerVersion;

            Config.findById(configId).exec()
                .then(function(config){
                    if(!config)
                        throw new errors.ResourceNotFoundError("Config not found");

                    if(name === config.name){ // If name hasn't changed, simply update the config
                        Config.findByIdAndUpdate(configId, {name: name, data: data, configVersion: configVersion, gameVersion: gameVersion, configServerVersion: configServerVersion}, {new: true}).exec()
                            .then(function(config){
                                res.json({config: config.toObject()});
                            })
                            .catch(next);
                    }
                    else { // If the name has changed, check if it's not taken first
                        Config.findOne({name: name, _id: {"$ne": config._id }}).exec()
                            .then(function(config){
                                if(config) {
                                    next(new ConfigNameTakenError("Config name already taken"));
                                } else {
                                    Config.findByIdAndUpdate(configId, {name: name, data: data, configVersion: configVersion, gameVersion: gameVersion, configServerVersion: configServerVersion}, {new: true}).exec()
                                        .then(function (cfg) {
                                            res.json({config: cfg.toObject()});
                                        })
                                        .catch(next);
                                }
                            })
                            .catch(next);
                    }
                })
                .catch(next);
        })

        .delete('/:configId', passportService.authenticate(), function (req, res, next) {
            if(!req.user.can({role: "writeConfigs", game: game}))
                return next(new errors.AuthorizationError("You have no access to this resource"));

            if(!req.params.configId)
                return next(new errors.InvalidQueryError("Invalid configId"));

            var configId = String(req.params.configId);

            Config.remove({_id: configId}).exec()
                .then(function(){
                    res.sendStatus(200);
                })
                .catch(next);
        });


    return router;
};