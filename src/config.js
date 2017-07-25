const merge = require('merge');
const path = require('path');

const config = {
    all: {
        env: process.env.NODE_ENV || 'development',
        root: path.join(__dirname, '..'),
        port: process.env.PORT || 8085,
        ip: process.env.IP || '0.0.0.0',
        jwtSecret: process.env['JWT_SECRET'] || 'TEST_SECRET',
        configServerVersion: parseInt(process.env.CONFIG_SERVER_VERSION) || 1,
        mongo: {
            options: {
                db: {
                    safe: true
                }
            }
        }
    },
    test: {
        mongo: {
            uri: 'mongodb://localhost/test-configs',
            options: {
                debug: false
            }
        }
    },
    development: {
        mongo: {
            uri: 'mongodb://localhost/configs',
            options: {
                debug: true
            }
        }
    },
    production: {
        mongo: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost/configs'
        }
    }
};

var conf = config.all;
merge.recursive(conf, config[config.all.env]);
module.exports = conf;