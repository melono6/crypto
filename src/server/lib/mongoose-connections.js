/*jslint node:true, nomen: true, esnext: true*/
'use strict';

const mongoose = require('mongoose'),
    config = require('config'),
    connections = config.get('mongodb.connections');

let dbs = {};

mongoose.Promise = global.Promise;

if (connections) {
    connections.forEach(function (conn) {
        let db;

        db = mongoose.createConnection(conn.connectionString);

        db.on('error', function (err) {
            console.log('MongoDB connection (%s) error: %s ', conn.name, err);
        });
        db.once('open', function () {
            console.log('MongoDB connection (%s) open. ', conn.name);
        });

        dbs[conn.name] = db;
    });
}

module.exports = dbs;
