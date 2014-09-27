'use strict';

exports.error = function (err) {
	console.error(err.stack || err);
};

exports.write = function (msg) {
	console.log(JSON.stringify(msg, null, 4));
};