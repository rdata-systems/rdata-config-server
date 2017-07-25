const http = require('http');
const config = require('./config');
const api = require('./api');
const express = require('./services/express');
const mongoose = require('./services/mongoose');

module.exports = {
    getExpress: function(routes){
        return express(routes);
    },
    getApi: function(connection, game){
        return api(connection, game)
    },
    getApp: function(connection, game){
        return this.getExpress([{path: '/api/v1', router: this.getApi(connection, game)}])
    },
    getServer: function(connection, game){
        return http.createServer(this.getApp(connection, game))
    },
    run: function() {
        var self = this;
        // Simple function to start the server
        setImmediate(function () {
            var connection = mongoose.createConnection(config.mongo.uri);
            var game = "game";
            var server = self.getServer(connection, game);
            server.listen(config.port, config.ip, function () {
                console.log('Express server listening on http://%s:%d, in %s mode', config.ip, config.port, config.env);
            });
        });
    }
};