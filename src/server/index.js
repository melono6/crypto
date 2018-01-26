/*jslint node:true, nomen:true, esnext: true*/
'use strict';

const path = require('path'),
    express = require('express'),
    config = require('config'),
    http = require('http'),
    enrouten = require('express-enrouten'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
    slashes = require('connect-slashes'),
    compression = require('compression');

let app,
    server;

http.globalAgent.maxSockets = Infinity;

app = express();

app.use(compression());

app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json({
    limit: '500kb'
}));

app.enable('strict routing');
app.use(slashes(false, { base: '/' + config.get('basePath') }));

app.use(express['static'](path.join(__dirname, '../../dist'), {
    redirect: false
}));

app.use(enrouten({
    directory: './controllers'
}));


server = app.listen(config.get('http.port'), function onServerStarted(err) {
    const host = server.address().address,
        port = server.address().port;

    if (err) {
        throw err;
    }

    console.log('App listening to %s at %s', host, port);
});


module.exports = app;
