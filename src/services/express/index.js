const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')
const config = require('../../config');
const errorHandlers = require('../../middlewares/error-handlers');

module.exports = function app(){

    const app = express();

    // Cross-origin resource sharing
    app.use(cors());

    // body-parser
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

    // compression
    app.use(compression());

    // morgan
    app.use(morgan('tiny'));

    // routes - taken from arguments

    if(arguments.length > 0 && arguments[0]) {
        if(arguments[0].constructor === Array) {
            var routes = arguments[0];
            for (var r in routes) {
                app.use(routes[r].path, routes[r].router);
            }
        }
        else if(typeof arguments[0] === 'object'){
            app.use(arguments[0].path, arguments[0].router);
        }
    }

    // error handlers
    app.use(errorHandlers.validationErrorHandler);
    app.use(errorHandlers.resourceNotFoundErrorHandler);
    app.use(errorHandlers.conflictErrorHandler);
    app.use(errorHandlers.notFoundErrorHandler);
    app.use(errorHandlers.authenticationErrorHandler);
    app.use(errorHandlers.authorizationErrorHandler);
    app.use(errorHandlers.clientErrorHandler);
    app.use(errorHandlers.errorHandler);

    return app;
};