'use strict';

var format = require('util').format;
var logger = require('./logger');
var parseDox = require('./parse-dox');

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
 * Проверка, является ли узел выражением, использующим this.
 *
 * @param  {object}  node
 * @return {boolean}
 */
function isThis(node) {
    return node.type === 'MemberExpression' && node.object.type === 'ThisExpression';
}

/**
 * Ищет ближайший блочный комментарий, парсит его и возвращает результат.
 *
 * @param  {object} block
 * @param  {object} method
 * @param  {string} method.method Название метода.
 * @param  {array}  comments
 * @return {object}
 */
function parseComments(block, method, comments) {
    if (!Array.isArray(comments)) {
        return;
    }

    var ln = comments.length;
    for (; ln--;) {
        var comment = comments[ln];
        if (comment.type !== 'Block' || comment.value.charAt(0) !== '*') {
            continue;
        }

        try {
            return parseDox(comment.value);
        } catch (e) {
            logger.warn(format(
                'Не получается распарсить jsdoc метода "%s()" блока "%s":',
                method.method,
                block.name
            ));
            logger.warn(trimSpaces(comment.value));

            return;
        }
    }
}

/**
 * Парсит название блока.
 *
 * @param  {object} node
 * @param  {object} source Информация об обрабатываемом блоке.
 * @return {object}
 */
function parseName(node, source) {
    switch (node.type) {
    case 'Literal':
        return {block: node.value};

    case 'ObjectExpression':
        return node.properties.reduce(function (block, prop) {
            if (prop.type !== 'Property') {
                return block;
            }

            block[prop.key.name] = prop.key.name === 'block' && isThis(prop.value) ?
                source.name :
                prop.value.value;

            return block;
        }, {});
    case 'MemberExpression':
        return {block: source.name};
    }
}

/**
 * Парсит методы блока.
 *
 * @param  {object} block
 * @param  {array}  methods
 * @param  {object} ignored
 * @return {array}
 */
function parseMethods(block, methods, ignored) {
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

        var comment = parseComments(block, parsed, method.leadingComments);
        if (comment) {
            parsed.comment = comment;
        }

        arr.push(parsed);

        return arr;
    }, []);
}

/**
 * Убирает отступы по краям у блочного комментария.
 *
 * @param  {string} comment
 * @return {string}
 */
function trimSpaces(comment) {
    return comment
        .split('\n')
        .map(function (string) {
            return string.trim();
        })
        .join('\n');
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

    ast = parseName(args[0], block) || {};

    types.forEach(function (type, i) {
        var arg = args[i + 1];

        arg && (ast[type] = parseMethods(block, arg.properties || [], ignoredMethods[i]));
    });

    return [ast, block, config];
};
