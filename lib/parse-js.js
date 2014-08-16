'use strict';

var esprima = require('esprima');
var traverse = require('./traverse');

function isBem(node) {
    return node.type === 'CallExpression' &&
        node.callee.property &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'decl';
}

module.exports = function (string) {
    var ast = esprima.parse(string, {attachComment: true});
    var bemNode;
    traverse(ast, function (node) {
        if (!isBem(node)) {
            return false;
        }

        bemNode = node;
        return true;
    });

    return bemNode;
};
