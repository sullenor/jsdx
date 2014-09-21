'use strict';

var fs = require('./fs');
var path = require('path');
var parseAst = require('./parse-ast');
var parseJs = require('./parse-js');

var SUFFIX = '.js';

/**
 * Проверяет, есть ли у блока файлик *.js.
 * Если да, парсит его содержимое и сохраняет в поле js.
 * 
 * @param  {object} block
 * @param  {string} block.name
 * @param  {string} block.path
 * @return {object}
 */
module.exports = function (block) {
	var file = path.join(block.path, block.name + SUFFIX);

	return fs.fileExists(file)
		.then(function (exist) {
			if (!exist) {
				return block;
			}

			return fs.read(file)
				.then(parseJs)
				.then(parseAst)
				.then(function (ast) {
					if (ast) {
						block.js = ast;
					}

					return block;
				});
		});
};
