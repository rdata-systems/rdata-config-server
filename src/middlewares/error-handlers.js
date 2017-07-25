const ClientError = require('../errors').ClientError;
const ResourceNotFoundError = require('../errors').ResourceNotFoundError;
const ConflictError = require('../errors').ConflictError;
const AuthorizationError = require('../errors').AuthorizationError;
const ValidationError = require('mongoose').Error.ValidationError;

// Mongoose validation error handler
function validationErrorHandler (err, req, res, next) {
    if (res.headersSent) return next(err);
    if(err && err instanceof ValidationError)
        return res.status(400).json({ error: err });

    next(err);
}

// Passport authentication error handler
function authenticationErrorHandler (err, req, res, next) {
    if (res.headersSent) return next(err);
    if(err && err.name === 'AuthenticationError') // Passport doens't expose authentication error
        return res.status(401).json({ error: err });

    next(err);
}

// Passport authorization error handler
function authorizationErrorHandler (err, req, res, next) {
    if (res.headersSent) return next(err);
    if(err && err instanceof AuthorizationError)
        return res.status(401).json({ error: err });

    next(err);
}

// Resource not found error handler
function resourceNotFoundErrorHandler (err, req, res, next){
    if (res.headersSent) return next(err);
    if (err && err instanceof ResourceNotFoundError)
        return res.status(404).json({error: { message: err.message, name: err.name } });

    next(err);
}

// Conflict error handler
function conflictErrorHandler (err, req, res, next){
    if (res.headersSent) return next(err);
    if (err && err instanceof ConflictError)
        return res.status(409).json({error: { message: err.message, name: err.name } });

    next(err);
}

// Client error handler
function clientErrorHandler (err, req, res, next){
    if (res.headersSent) return next(err);
    if (err && err instanceof ClientError)
        return res.status(400).json({error: { message: err.message, name: err.name } });

    next(err);
}

// Error of unknown type occured. Don't expose it on Production
function errorHandler (err, req, res, next) {
    if (res.headersSent) return next(err);
    if(!err) return next(err);

    console.error(err.stack);

    res.status(err.status || 500);
    if(process.env.NODE_ENV === 'production')
        return res.json({ error: { message: "Internal server error", name: "InternalServerError" } });

    // For development/test environments, send the actual error
    return res.json({ error: { message: err.message, name: err.name }});
}

// This handler goes last. If we are here this means 404
function notFoundErrorHandler (req, res, next) {
    res.status(404).json({ error: { message: "404 not found", name: "NotFound"} })
}



module.exports.validationErrorHandler = validationErrorHandler;
module.exports.resourceNotFoundErrorHandler = resourceNotFoundErrorHandler;
module.exports.conflictErrorHandler = conflictErrorHandler;
module.exports.clientErrorHandler = clientErrorHandler;
module.exports.errorHandler = errorHandler;
module.exports.notFoundErrorHandler = notFoundErrorHandler;
module.exports.authenticationErrorHandler = authenticationErrorHandler;
module.exports.authorizationErrorHandler = authorizationErrorHandler;