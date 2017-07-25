'use strict';

const config = require('../config');
const mongoose = require('mongoose')
    , Schema = mongoose.Schema;

const configSchema = new Schema({
    name: {
        type: String,
        index: true
    },
    configVersion: {
        type: Number
    },
    gameVersion: {
        type: Number
    },
    configServerVersion: {
        type: Number
    },
    data: {
        type: Object
    }
}, { timestamps: true });

if (!configSchema.options.toObject) configSchema.options.toObject = {};
configSchema.options.toObject.transform = function transform(doc, ret, options) {
    return {
        id: ret._id,
        name: ret.name,
        data: ret.data,
        configVersion: ret.configVersion,
        gameVersion: ret.gameVersion,
        configServerVersion: ret.configServerVersion
    }
};

module.exports = {
    configSchema: configSchema,
    createConfigModel: function createConfigModel(connection){
        return connection.model('Config', configSchema, 'configs');
    }
};