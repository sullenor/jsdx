'use strict';

var fs = require('fs');
var events = require('events');
var path = require('path');
var util = require('util');

var Level = require('./level');
var Queue = require('sparepart/lib/queue');

var inherits = util.inherits;

/**
 * @param {String[]} directories
 */
function Tree(directories) {
  Queue.call(this);

  this.paths = directories;
}

inherits(Tree, Queue);

var proto = Tree.prototype;

/**
 * @param {String} directory Абсолютный путь.
 */
proto._addLevel = function (directory) {
  var that = this;
  var level = new Level(directory);

  this.levels.push(level);

  this._addOrders();

  level.once('done', function () {
    that._removeOrder();
    that._checkOrders();
  });

  level.read();
};

proto.read = function () {
  this.levels = [];

  this.paths.forEach(function (directory) {
    this._addLevel(path.resolve(directory));
  }, this);

  return this;
};

module.exports = Tree;
