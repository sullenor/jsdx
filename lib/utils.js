'use strict';

var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

/**
 * Возвращает переданный аргумент.
 * 
 * @param  {*} a
 * @return {*}
 */
exports.identity = function (a) {
	return a;
};

/**
 * Частичное применение.
 * 
 * @param  {function} fn
 * @return {function}
 */
exports.partial = function (fn) {
	var args = slice.call(arguments, 1);

	return function () {
		return fn.apply(null, concat.apply(args, arguments));
	};
};

/**
 * Вызывает функцию с разбитым массивом аргументов.
 *
 * @param  {function} fn
 * @param  {object}   ctx Контекст
 * @return {function}
 */
exports.splat = function (fn, ctx) {
    return function (arr) {
        return fn.apply(ctx, arr);
    };
};