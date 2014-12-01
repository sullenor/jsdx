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
  // this.once('filesInDir', function (files) {});

  // this._readDir();
};

Core.prototype._readMods = function () {};

Core.prototype._readVals = function () {};

Core.prototype._stat = function (file) {
  var filePath = path.join(this.dir, file);
  var that = this;

  fs.stat(filePath, function (err, stats) {
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

inherits(Core, EventEmitter);
