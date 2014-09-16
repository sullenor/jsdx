'use strict';

exports.error = function (msg) {
    console.error(msg.stack || msg);
};

exports.format = function (msg) {
    return JSON.stringify(msg, null, 4);
};

exports.warn = function (msg) {
    console.warn(msg);
};

exports.write = function (msg) {
    console.log(msg);
};
