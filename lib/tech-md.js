'use strict';

var _ = require('lodash');
var fs = require('./fs');
var marked = require('marked');
var path = require('path');

/**
 * Суффикс файлов, которые могут содержать дополнительную документацию.
 * 
 * @type {string}
 */
var SUFFIX = '.ru.md';

/**
 * Переобразует список путей к некоторой абстракции.
 *
 * @param  {array} dirs
 * @return {array}
 */
function build(dirs) {
    return dirs.map(function (dir) {
        return {name: path.basename(dir).replace(/^_+/, ''), path: dir};
    });
}

/**
 * Выделяет элементы из списка папок.
 * 
 * @param  {array} dirs
 * @return {array}
 */
function getElems(dirs) {
	return dirs.filter(function (dir) {
		return /\/(?:__)?[a-z\-]+$/i.test(dir);
	});
}

/**
 * Выделяет модификаторы из списка папок.
 * 
 * @param  {array} dirs
 * @return {array}
 */
function getMods(dirs) {
	return dirs.filter(function (dir) {
		return /\/[a-z\-]+$/i.test(dir);
	});
}

/**
 * Вызывает функцию с разбитым массивом аргументов.
 *
 * @param  {function} fn
 * @param  {object}   ctx Контекст
 * @return {function}
 */
function splat(fn, ctx) {
    return function (arr) {
        return fn.apply(ctx, arr);
    };
}

/**
 * Получает список компонентов блока и подтягивает документацию по ним.
 * 
 * @param  {object}  block
 * @return {promise}
 */
module.exports = function (block) {
	block.md = {};

	return fs.readdir(block.path)
		.then(fs.separate)
		.then(splat(_.identity))
		.then(function (dirs) {
			var elems = getElems(dirs);
			if (elems.length) {
				block.md.elems = build(elems);
			}

			var mods = getMods(dirs);
			if (mods.length) {
				block.md.mods = build(mods);
			}
		});
};

// {
// 	name: 'block',
// 	path: '-',
// 	md: {
// 		path: '-',
// 		mods: [
// 			{
// 				name: 'm',
// 				path: '-'
// 			}
// 		],
// 		elems: [
// 			{
// 				name: 'e',
// 				path: '-'
// 			},
// 			{
// 				name: 'e',
// 				path: '-',
//				mods: [...]
// 			}
// 		]
// 	}
// }