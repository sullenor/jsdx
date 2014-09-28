'use strict';

var fs = require('./fs');
var path = require('path');
var splat = require('./utils').splat;

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
function filter(dirs) {
    return dirs.filter(function (dir) {
        return /\/[a-z\-]+$/i.test(dir);
    });
}

/**
 * Возвращает список блок для указанного уровня.
 *
 * @param  {string}  level  Абсолютный путь
 * @param  {object}  config
 * @return {promise}
 */
module.exports = function (level) {
    return fs.readdir(level)
        .then(fs.separate)
        .then(splat(filter))
        .then(build);
};