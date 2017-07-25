const Router = require('express').Router;
const configs = require('./configs');


module.exports = function(connection, game) {
    const router = new Router();
    router.use('/configs', configs(connection, game));

    return router;
};