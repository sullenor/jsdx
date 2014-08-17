'use strict';

var files = require('./lib/files');
var vow = require('vow');

function name(pathName) {
    return String(pathName.match(/\/([a-z\.\-]+)$/i)[1]);
}

/**
 * @param  {(string|string[])} nodes
 * @return {object}
 */
module.exports = function (nodes) {
    Array.isArray(nodes) || (nodes = [nodes]);
    var ast = {nodes: []};

    return vow.all(nodes.map(function (nodePath) {
        var node = {name: name(nodePath), path: nodePath};
        return files(nodePath)
            .then(function (list) {
                node.content = list;
                ast.nodes.push(node);
                return node;
            });
    }))
        .then(function () {
            return ast;
        });
};
