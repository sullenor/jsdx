'use strict';

var fs = require('./fs');
var path = require('path');
var utils = require('./utils');

var identity = utils.identity;
var partial = utils.partial;
var splat = utils.splat;

/**
 * Пишет полученное дерево в файлик "<output>/js/ast.js".
 *
 * @param  {object}  ast
 * @param  {object}  config
 * @return {promise}
 */
function writeAst(ast, config) {
    var data = 'function provide(){return ' + JSON.stringify(ast) + ';};';
    var file = path.join(config.output, 'js', 'ast.js');

    return fs.write(file, data);
}

/**
 * Копирует статические файлики в указанную папку.
 *
 * @param  {object}  ast
 * @param  {object}  config
 * @return {promise}
 */
module.exports = function (ast, config) {
    if (!config.output) {
        throw new Error('Sorry, i don\'t know where to put the static files.');
    }

    return fs.mkdir(config.output)
        .then(partial(fs.copy, config.source, config.output))
        .then(partial(writeAst, ast, config))
        .then(partial(identity, [ast, config]));
};