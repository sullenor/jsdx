'use strict';

var childProcess = require('child_process');
var path = require('path');
var Promise = require('vow').Promise;
var vowFs = require('vow-fs');

exports.copy = function (source, target) {
    var command = [
        'cp',
        '-r',
        source,
        target
    ].join(' ');

    return new Promise(function (resolve, reject) {
        childProcess.exec(command, function (error, stdout, stderr) {
            if (stderr || error) {
                return reject(error || stderr);
            }

            resolve(stdout);
        })
    });
};

/**
 * Проверяет существует ли указанный путь и если да, то является ли он файлом.
 *
 * @param  {string}  file
 * @return {promise}
 */
exports.isfile = function (file) {
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
 * Создает папку.
 *
 * @param  {string}  dir
 * @return {promise}
 */
exports.mkdir = function (dir) {
    return vowFs.makeDir(dir);
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
        .then(function (files) {
            return files.map(function (file) {
                return path.resolve(dir, file);
            });
        });
};

/**
 * Разделяет указанный список на списки папок и файлов.
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

/**
 * Пишет данные в файл.
 *
 * @param  {string}  file
 * @param  {string}  data
 * @return {promise}
 */
exports.write = function (file, data) {
    return vowFs.write(file, data, {encoding: 'utf8'});
};