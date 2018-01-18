/*jslint node:true, nomen:true, esnext: true */
'use strict';

const Supplier = require('../../../../models/supplier'),
    crudRoutes = require('../../../../lib/crud');

module.exports = function (router) {
    crudRoutes(router, Supplier);
};
