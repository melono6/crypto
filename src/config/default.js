/*jslint node:true, esnext: true */
'use strict';

const cfg = {};

cfg.http = {
    port: process.env.PORT || 5000
};

cfg.baseUrl = 'http://127.0.0.1:5000';
cfg.basePath = '';

cfg.mongodb = {
    connections: [{
        name: "main",
        connectionString: "mongodb://localhost:27017/crypto"
    }]
};

module.exports = cfg;
