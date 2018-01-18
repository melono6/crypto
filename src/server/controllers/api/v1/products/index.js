/*jslint node:true, nomen:true, esnext: true */
'use strict';

const Product = require('../../../../models/product'),
    crudRoutes = require('../../../../lib/crud');

module.exports = function (router) {
    crudRoutes(router, Product);
};
