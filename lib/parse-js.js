'use strict';

var esprima = require('esprima');
var traverse = require('./traverse');

/**
 * @param  {object}  node
 * @return {Boolean}
 */
function isBem(node) {
    return node.type === 'CallExpression' &&
        node.callee.property &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'decl';
}

/**
 * @param  {string} string
 * @return {object}
 */
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
