const express = require('express');
const request = require('supertest');
const appFactory = require('./index');

describe('express', function(){
    it('creates server using path and router', function(done){

        var router = express.Router();
        router.get('/', function (req, res) {
            res.send('test');
        });

        var app = appFactory({path: '/', router: router});

        request(app)
            .get('/')
            .expect(200, done);
    });

    it('creates server with array of paths and routers', function(done) {
        var routerA = express.Router();
        routerA.get('/', function (req, res) {
            res.send('testa');
        });
        var routerB = express.Router();
        routerB.get('/', function (req, res) {
            res.send('testb');
        });

        var routes = [
            {path: '/a', router: routerA},
            {path: '/b', router: routerB}
        ];
        var app = appFactory(routes);

        request(app)
            .get('/a')
            .expect(200, function(){
                request(app)
                    .get('/b')
                    .expect(200, done);
            });
    });
});