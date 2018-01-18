/*jslint node:true, nomen:true, esnext: true */
'use strict';

const Portfolio = require('../../../../models/portfolio'),
    crudRoutes = require('../../../../lib/crud');

module.exports = function (router) {
    crudRoutes(router, Portfolio);
};
