'use strict';

var parseDx = require('./parse-dox');

/**
 * @param  {array}  comments
 * @return {object}
 */
function first(comments) {
    var ln = comments.length;
    for (; ln--;) {
        var comment = comments[ln];
        if (comment.type !== 'Block' || comment.value.charAt(0) !== '*') {
            continue;
        }

        return parseDx(comment.value);
    }
}

/**
 * @param  {array} methods
 * @param  {array} omit
 * @return {array}
 */
function format(methods, omit) {
    return methods
        .filter(function (method) {
            return omit.indexOf(method.key.name) === -1;
        })
        .map(function (method) {
            var m = {method: method.key.name};

            if (method.leadingComments) {
                m.comment = first(method.leadingComments);
            }

            return m;
        });
}

/**
 * @param  {object} node
 * @return {object}
 */
function name(node) {
    switch (node.type) {
    case 'Literal':
        return {block: node.value};

    case 'ObjectExpression':
        var block = {};

        node.properties.forEach(function (prop) {
            prop.type === 'Property' &&
                (block[prop.key.name] = prop.value.value);
        });

        return block;
    }
}

/**
 * @param  {object} ast
 * @return {object}
 */
module.exports = function (ast) {
    if (!ast) {
        return ast;
    }

    var args = ast.arguments;
    var block = name(args[0]) || {};

    if (args[1]) {
        block.blockMethods = format(args[1].properties, ['destruct', 'onElemSetMod', 'onSetMod']);
    }

    if (args[2]) {
        block.staticMethods = format(args[2].properties, ['live']);
    }

    return block;
};
