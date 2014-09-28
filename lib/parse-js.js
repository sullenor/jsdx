'use strict';

var esprima = require('esprima');
var traverse = require('./traverse');

/**
 * Матчится на декларацию БЕМ блока, а именно на вызов метода decl.
 *
 * @param  {object}  node
 * @return {boolean}
 */
function isBem(node) {
    return node.type === 'CallExpression' &&
        node.callee.property &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'decl';
}

/**
 * Парсит содержимое js файла и возвращает БЕМ блок.
 * В противном случае вернет undefined.
 *
 * @param  {string} string
 * @return {object}
 */
module.exports = function (string, config) {
    var ast = esprima.parse(string, {attachComment: true});
    var bemNode;
    traverse(ast, function (node) {
        if (!isBem(node)) {
            return false;
        }

        bemNode = node;
        return true;
    });

    return [bemNode, config];
};