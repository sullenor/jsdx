'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

function Core() {
  EventEmitter.call(this);
  // this.block;
  // this.elem;
  // this.mod;
  // this.val;
}

inherits(Core, EventEmitter);

Core.prototype._readDir = function () {
  var that = this;

  fs.readdir(this.dir, function (err, files) {
    if (err) {
      return that.emit('error', err);
    }

    that.emit('filesInDir', files);
  });
};

Core.prototype._readElements = function () {
  var that = this;

  this.on('dir', function (dir) {
    console.log(dir);
  });

  this.once('filesInDir', function (files) {
    that._length = files.length;

    files.forEach(that._stat, that);
  });
};

Core.prototype._readMods = function () {};

Core.prototype._readVals = function () {};

Core.prototype._stat = function (file, type) {
  var filePath = path.join(this.dir, file);
  var that = this;

  fs.stat(filePath, function (err, stats) {
    that._length--;

    if (err) {
      return that.emit('error', err);
    }

    if (stats.isDirectory()) {
      that.emit('dir', filePath);
    }

    if (stats.isFile()) {
      that.emit('file', filePath);
    }
  });
};

function Block() {}

inherits(Block, Core);

/**
 * @param  {string[]} component
 * @return {promise}
 */
Block.prototype.read = function (component) {
  this._readElements();
  this._readMods();

  this._readDir();
};
