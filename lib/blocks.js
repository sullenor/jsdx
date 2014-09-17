'use strict';

var Promise = require('vow').Promise;

/**
 * Возвращает список блок для указанного уровня.
 *
 * @param  {string}  level Абсолютный путь
 * @return {promise}
 */
module.exports = function (level) {
    // Заглушка
    return new Promise(function (resolve) {resolve([]);});
};
