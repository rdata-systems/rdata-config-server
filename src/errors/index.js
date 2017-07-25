'use strict';

const ClientError = function ClientError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};
require('util').inherits(ClientError, Error);

const ConflictError = function ConflictError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};
require('util').inherits(ConflictError, ClientError);


const AuthorizationError = function UnauthorizedError(message, extra){
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};
require('util').inherits(AuthorizationError, ClientError);


const InvalidQueryError = function InvalidQueryError(message, extra){
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};
require('util').inherits(InvalidQueryError, ClientError);


const ResourceNotFoundError = function ResourceNotFoundError(message, extra){
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};
require('util').inherits(ResourceNotFoundError, ClientError);


module.exports.ClientError = ClientError;
module.exports.ConflictError = ConflictError;
module.exports.AuthorizationError = AuthorizationError;
module.exports.InvalidQueryError = InvalidQueryError;
module.exports.ResourceNotFoundError = ResourceNotFoundError;