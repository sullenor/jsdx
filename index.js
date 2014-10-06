'use strict';

var format = require('util').format;
var getBlocks = require('./lib/blocks');
var path = require('path');
var Promise = require('vow').Promise;
var utils = require('./lib/utils');

var identity = utils.identity;
var partial = utils.partial;
var splat = utils.splat;

/**
 * Преобразует уровни и подтягивает список блоков.
 *
 * @param  {array}   levels
 * @param  {array}   ast
 * @param  {object}  config
 * @return {promise}
 */
function build(levels, ast, config) {
    return Promise.all(levels
        .map(function (level) {
            var node = {name: path.basename(level), path: path.resolve(level)};
            ast.push(node);

            return getBlocks(node.path, config)
                .then(function (blocks) {
                    node.blocks = blocks;

                    return node;
                });
        }))
        .then(function (nodes) {
            return [nodes, config];
        });
}

/**
 * Натравливает технологии на блоки.
 *
 * @param  {array}   nodes
 * @param  {object}  config
 * @return {promise}
 */
function complete(nodes, config) {
    return Promise.all(nodes.map(function (node) {
        return Promise.all(node.blocks.map(function (block) {
            return getTechs(config.techs)
                .then(function (techs) {
                    return Promise.all(techs.map(function (tech) {
                        return tech(block, config);
                    }));
                })
                .then(partial(identity, block));
        }));
    }));
}

var techCache;

/**
 * Кэширует и возвращает список модулей.
 *
 * @param  {array}   techs
 * @return {promise}
 */
function getTechs(techs) {
    return techCache ?
        Promise.cast(techCache) :
        (techCache = Promise.all(techs.map(loadTech)));
}

/**
 * Подгружает модуль для указанной технологии.
 *
 * @param  {string}  tech
 * @return {promise}
 */
function loadTech(techName) {
    var modulePath = format('./lib/tech-%s', techName);
    var tech;

    return new Promise(function (resolve, reject) {
        try {
            tech = require(modulePath);
        } catch(e) {
            return reject(format(
                'Can\'t find module "%s" for the "%s" tech.',
                path.basename(modulePath),
                techName
            ));
        }

        resolve(tech);
    });
}

/**
 * Собирает документацию по заданным уровням с блоками.
 *
 * @param  {(string|string[])} levels
 * @param  {object}            config
 * @return {object}
 */
module.exports = function (levels, config) {
    config = config || {};
    config.techs = config.techs || ['js', 'md'];

    if (!Array.isArray(levels)) {
        levels = [levels];
    }

    var ast = {levels: []};

    return build(levels, ast.levels, config)
        .then(splat(complete))
        .then(partial(identity, [ast, config]));
};