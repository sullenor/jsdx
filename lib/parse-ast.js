'use strict';

var logger = require('./logger');
// var parseDox = require('./parse-dox');

/**
 * Список методов, которые игнорируются.
 *
 * @type {array}
 */
var ignoredMethods = [
    {
        destruct: true,
        onElemSetMod: true,
        onSetMod: true
    },
    {
        live: true
    }
];

/**
 * Возможные типы методов у блока.
 *
 * @type {array}
 */
var types = [
    'blockMethods',
    'staticMethods'
];

/**
 * Ищет ближайший блочный комментарий, парсит его и возвращает результат.
 *
 * @param  {array}  comments
 * @return {object}
 */
function parseComments(comments) {
    if (!Array.isArray(comments)) {
        return;
    }

    var ln = comments.length;
    for (; ln--;) {
        var comment = comments[ln];
        if (comment.type !== 'Block' || comment.value.charAt(0) !== '*') {
            continue;
        }

        return comment.value;
        // return parseDox(comment.value);
    }
}

/**
 * Парсит название блока.
 *
 * @param  {object} node
 * @return {object}
 */
function parseName(node) {
    switch (node.type) {
    case 'Literal':
        return {block: node.value};

    case 'ObjectExpression':
        return node.properties.reduce(function (block, prop) {
            prop.type === 'Property' &&
                (block[prop.key.name] = prop.value.value);

            return block;
        }, {});
    }
}

/**
 * Парсит методы блока.
 *
 * @param  {array}  methods
 * @param  {object} ignored
 * @return {array}
 */
function parseMethods(methods, ignored) {
    return methods.reduce(function (arr, method) {
        if (ignored[method.key.name]) {
            return arr;
        }

        var parsed = {method: method.key.name};

        if (Array.isArray(method.value.params) && method.value.params.length) {
            parsed.args = method.value.params.map(function (a) {
                return a.name;
            });
        }

        var comment = parseComments(method.leadingComments);
        comment && (parsed.comment = comment);

        arr.push(parsed);

        return arr;
    }, []);
}

/**
 * Преобразует исходное дерево к более читаемому виду.
 *
 * @param  {object} ast
 * @param  {object} block
 * @return {object}
 */
module.exports = function (ast, block, config) {
    if (!ast) {
        return ast;
    }

    var args = ast.arguments;

    if (!Array.isArray(args)) {
        return logger.warn('Unknown structure');
    }

    ast = parseName(args[0]) || {};

    types.forEach(function (type, i) {
        var arg = args[i + 1];

        arg && (ast[type] = parseMethods(arg.properties, ignoredMethods[i]));
    });

    return [ast, config];
};