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

Core.prototype.readElements = function () {};

Core.prototype.readMods = function () {};

Core.prototype.readVals = function () {};

inherits(Core, EventEmitter);



function Block() {}

inherits(Block, Core);



function Element() {}

inherits(Element, Core);



function Mod() {}

inherits(Mod, Core);



function Val() {}

inherits(Val, Core);
