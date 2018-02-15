/*jslint node:true, nomen:true, esnext: true */
'use strict';

const https = require('https');

module.exports = function (router) {
    router.get('/',
        (req, res) => {
        
        let query = req.url;
        
        https.get({
            hostname: 'www.cryptocompare.com',
            path: '/api/data/coinsnapshotfullbyid/' + query,
            port: 443,
            rejectUnauthorized: false
        }, (resp) => {
            let body = '';

            resp.setEncoding('utf8');
            resp.on('data', (d) => {
                body += d;
            });
            
            resp.on('end', () => {
                res.send(body);
            });
        }).on('error', (e) => {
          console.error(e);
        });
    });
};
