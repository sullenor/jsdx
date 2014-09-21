'use strict';

var path = require('path');
// var Promise = require('vow').Promise;
var vowFs = require('vow-fs');

/**
 * Проверяет существует ли указанный путь и если да, то является ли он файлом.
 *
 * @param  {string}  file
 * @return {promise}
 */
exports.fileExists = function (file) {
    return vowFs.isFile(file)
        .catch(function (err) {
            return new Promise(function (resolve, reject) {
                if (err.code !== 'ENOENT') {
                    return reject(err);
                }
                
                resolve(false);
            });
        });
};

/**
 * Считывает содержимое указанного файла.
 * 
 * @param  {string}  path
 * @return {promise}
 */
exports.read = function (path) {
    return vowFs.read(path, {encoding: 'utf-8'});
};

/**
 * Получает список файлов папки и разрешает их в абсолютные пути.
 *
 * @param  {string}  dir
 * @return {promise}
 */
exports.readdir = function (dir) {
    return vowFs.listDir(dir)
        .then(function (filesList) {
            return filesList.map(function (filePath) {
                return path.resolve(dir, filePath);
            });
        });
};

/**
 * Разбивает исходный список файлов на списоки папок и файлов.
 *
 * @param  {array}   filesList
 * @return {promise}
 */
exports.separate = function (filesList) {
    var dirs = [];
    var files = [];

    return Promise.all(filesList.map(vowFs.isDir, vowFs))
        .then(function (output) {
            output.forEach(function (isdir, i) {
                if (isdir) {
                    dirs.push(filesList[i]);
                } else {
                    files.push(filesList[i]);
                }
            });

            return [dirs, files];
        });
};
