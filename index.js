'use strict';

var coverage = require('./lib/coverage');
var files = require('./lib/files');
var parseAst = require('./lib/parse-ast');
var parseJs = require('./lib/parse-js');
var parseMd = require('./lib/parse-md');
var path = require('path');
var utils = require('./lib/utils');
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
    nodes = nodes.map(function (node) {
        return path.resolve(node);
    });
    var ast = {nodes: []};

    return vow.all(nodes.map(function (nodePath) {
        var node = {name: name(nodePath), path: nodePath};
        return files(nodePath)
            .then(function (list) {
                node.content = list;
                ast.nodes.push(node);
                return list;
            })
            .then(function (list) {
                return vow.all(list.map(function (block) {
                    if (!block.js) {
                        return block;
                    }

                    return utils.readFile(block.js)
                        .then(parseJs)
                        .then(parseAst)
                        .then(function (jsAst) {
                            block.js = jsAst;
                            return block;
                        })
                        .then(coverage.block);
                }));
            })
            .then(function (list) {
                return vow.all(list.map(function (block) {
                    if (!block.md) {
                        return block;
                    }

                    return utils.readFile(block.md)
                        .then(parseMd)
                        .then(function (html) {
                            block.md = html;
                            return block;
                        });
                }));
            });
    }))
        .then(function () {
            return ast;
        })
        .then(function (ast) {
            ast.nodes.forEach(coverage.total);
            return ast;
        });
};
