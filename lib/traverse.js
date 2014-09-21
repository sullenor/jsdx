'use strict';

/**
 * Список итерируемых полей
 * 
 * @type {Array}
 */
var props = [
    'arguments',
    'body',
    'callee',
    'expression',
    'object',
    'properties'
];

/**
 * Проверка на null и тип.
 * 
 * @param  {*}       node
 * @return {Boolean}
 */
function isObject(node) {
    return node && typeof node === 'object';
}

/**
 * Обходит асд и для каждого узла вызывает функцию fn.
 * Если функция вернет true, то дальнейший обход дерева прекращается.
 * 
 * @param  {object}   ast
 * @param  {function} fn
 * @param  {boolean}  result
 * @return {boolean}
 */
function traverse(ast, fn, result) {
    if (result = fn(ast, result) === true) {
        return true;
    }

    return props.some(function (prop) {
        var child = ast[prop];

        if (isObject(child)) {
            if (Array.isArray(child)) {
                return child.some(function (childElem) {
                    return isObject(childElem) && traverse(childElem, fn, result);
                });
            } else {
                return traverse(child, fn, result);
            }
        }
    });
}

module.exports = traverse;