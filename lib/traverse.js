'use strict';

var props = [
    'arguments',
    'body',
    'callee',
    'expression',
    'object',
    'properties'
];

function isObject(node) {
    return node && typeof node === 'object';
}

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
