'use strict';

var _ = require('lodash');
var fs = require('./fs');
var path = require('path');

/**
 * Переобразует список путей к некоторой абстракции.
 *
 * @param  {array} dirs
 * @return {array}
 */
function build(dirs) {
    return dirs.map(function (dir) {
        return {name: path.basename(dir), path: dir};
    });
}

/**
 * Выделяет блоки из исходного списка папок.
 *
 * @param  {array} dirs Массив абсолютных путей.
 * @return {array}
 */
function filterBlocks(dirs) {
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
 * Возвращает список блок для указанного уровня.
 *
 * @param  {string}  level Абсолютный путь
 * @return {promise}
 */
module.exports = function (level) {
    return fs.readdir(level)
        .then(fs.separate)
        .then(splat(_.identity))
        .then(filterBlocks)
        .then(build);
};
