'use strict';

var files = require('./lib/files');
var vow = require('vow');

/**
 * @param  {(string|string[])} nodes
 * @return {object}
 */
module.exports = function (nodes) {
    Array.isArray(nodes) || (nodes = [nodes]);
    var ast = {};

    return vow.all(nodes.map(function (node) {
        return files(node);
    }));
};
