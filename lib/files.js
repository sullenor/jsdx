'use strict';

var _ = require('lodash');
var path = require('path');
var utils = require('./utils');
var vow = require('vow');

function attach(block, options) {
    options = options || {};
    return vow.all(_.map(options, function (ext, prop) {
        var pathName = path.resolve(block.path, ext.replace('?', block.name));
        return utils.fileExists(pathName, function (pathName) {
            block[prop] = pathName;
        });
    }))
        .then(function () {
            return block;
        });
}

function build(pathName, type) {
    return {name: name(pathName, type), path: pathName, type: type};
}

function map(fn) {
    return function (arr) {
        return vow.all(arr.map(fn));
    };
}

function name(pathName) {
    return String(pathName.match(/\/([a-z\-]+)$/i)[1]);
}

module.exports = function (pathName) {
    return utils.listDir(pathName)
        .then(utils.filterFiles({mask: /\/[a-z\-]+$/i, type: 'dir'}))
        .then(map(utils.first(_.partialRight(build, 'block'))))
        .then(map(utils.first(_.partialRight(attach, {js: '?.js', md: '?.ru.md'}))));
};
