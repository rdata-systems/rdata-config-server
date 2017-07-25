'use strict';

/**
 * Provides a service to work with user roles
 */
const ROLE_READ = "read";
const ROLE_WRITE = "write";
const ROLE_READ_WRITE = "readWrite";
const ROLE_READ_DATA = "readData";
const ROLE_WRITE_DATA = "writeData";
const ROLE_READ_WRITE_DATA = "readWriteData";
const ROLE_READ_CONFIGS = "readConfigs";
const ROLE_WRITE_CONFIGS = "writeConfigs";
const ROLE_READ_WRITE_CONFIGS = "readWriteConfigs";

const roles = {};
roles[ROLE_READ] =                 parseInt('000001', 2);
roles[ROLE_WRITE] =                parseInt('000010', 2);
roles[ROLE_READ_WRITE] =           parseInt('000011', 2);
roles[ROLE_READ_DATA] =            parseInt('000100', 2);
roles[ROLE_WRITE_DATA] =           parseInt('001000', 2);
roles[ROLE_READ_WRITE_DATA] =      parseInt('001100', 2);
roles[ROLE_READ_CONFIGS] =         parseInt('010000', 2);
roles[ROLE_WRITE_CONFIGS] =        parseInt('100000', 2);
roles[ROLE_READ_WRITE_CONFIGS] =   parseInt('110000', 2);

function User(jwtUser){
    var self = this;

    this.id = jwtUser.id;
    this.email = jwtUser.email;
    this.username = jwtUser.username;
    this.roles = jwtUser.roles;

    this.can = function can(){
        var role, game, group; // arguments
        if(arguments.length === 0)
            throw new Error("can requires at least 1 argument");

        if(typeof arguments[0] === 'object'){
            role = arguments[0].role || null;
            game = arguments[0].game || null;
            group = arguments[0].group || null;
        }
        else
        {
            role = arguments[0];
            game = arguments.length > 0 ? arguments[1] : null;
            group = arguments.length > 1 ? arguments[2] : null;
        }

        // Check if user has any role that matches the pattern
        for(var i in this.roles){
            var userRole = this.roles[i];
            if((roles[role] & roles[userRole.role]) === roles[role] &&
                (!userRole.group || group === userRole.group) &&
                (!userRole.game || game === userRole.game))
                return true;
        }
        return false;
    }

}

module.exports = User;