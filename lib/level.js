'use strict';

var events = require('events');
var fs = require('fs');
var path = require('path');
var util = require('util');

var Block = require('sparepart/lib/block');
var Queue = require('sparepart/lib/queue');

var inherits = util.inherits;

function Level(directory) {
  Queue.call(this);

  this.path = directory;
}

inherits(Level, Queue);

var proto = Level.prototype;

/**
 * @param  {String} dirpath Абсолютный путь.
 * @param  {String} dirname
 */
proto._determine = function (dirpath, dirname) {
  var that = this;
  var bem = new Block(dirpath);

  this.blocks.push(bem);

  this._addOrders();

  bem.once('done', function () {
    that._removeOrder();
    that._checkOrders();
  });

  bem.read();
};

/**
 * @emits {raw}
 */
proto._readdir = function () {
  var directory = this.path;
  var that = this;

  this.on('raw', this._stats);

  fs.readdir(directory, function (err, files) {
    if (err) {
      throw err;
    }

    that._addOrders(files.length);

    files.forEach(function (file) {
      that.emit('raw', path.join(directory, file), file);
    });

    that.removeListener('raw', that._stats);
  });
};

/**
 * @emits {directory}
 * @emits {file}
 * @param {String}    filepath Абсолютный путь.
 * @param {String}    file
 */
proto._stats = function (filepath, file) {
  var that = this;

  fs.stat(filepath, function (err, stats) {
    if (err) {
      throw err;
    }

    that._removeOrder();

    if (stats.isDirectory()) {
      that.emit('directory', filepath, file);
    }

    that._checkOrders();
  });
};

/**
 * @return {Core}
 */
proto.read = function () {
  var that = this;

  this.blocks = [];

  this.on('directory', this._determine);

  this.once('done', function () {
    that.removeListener('directory', that._determine);
  });

  this._readdir();

  return this;
};

module.exports = Level;
