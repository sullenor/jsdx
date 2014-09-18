'use strict';

var _ = require('lodash');
var fs = require('./fs');
var marked = require('marked');
var path = require('path');
var Promise = require('vow').Promise;
var util = require('util');

/**
 * Суффикс файлов, которые могут содержать дополнительную документацию.
 * 
 * @type {string}
 */
var SUFFIX = '.deps.js';

/**
 * Проверяет, является ли папка элементом.
 * 
 * @param  {string}  dir
 * @return {boolean}
 */
function isElem(dir) {
	return /\/(?:__)?[a-z\-]+$/i.test(dir);
}

/**
 * Проверяет, является ли папка модификатором.
 * 
 * @param  {string}  dir
 * @return {boolean}
 */
function isMod(dir) {
	return /\/[a-z\-]+$/i.test(dir);
}

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

function resolve(type, block, elem, mod, val) {
	var name;

	switch (type) {
	case 'mod':
		name = util.format('%s_%s', block, mod);
		return name + (val ? '_' + val : '');
	case 'elem':
		return util.format('%s__%s', block, elem);
	case 'elemmod':
		name = util.format('%s__%s_%s', block, elem, mod);
		return name + (val ? '_' + val : '');
	}
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
			var elems = [];
			var mods = [];

			dirs.forEach(function (dir) {
				isElem(dir) && elems.push(dir);
				isMod(dir) && mods.push(dir);
			});

			return [elems, mods];
		})
		.then(splat(function (elems, mods) {
			return Promise.all(build(elems)
				.map(function (elem) {
					var file = path.join(elem.path, block.name + '__' + elem.name + SUFFIX);

					return fs.fileExists(file)
						.then(function (exist) {
							if (exist) {
								elem.dox = file;
							}

							return elem;
						});
				}))
				.then(function (elems) {
					if (elems.length) {
						block.md.elems = elems;
					}
				});
		}));
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