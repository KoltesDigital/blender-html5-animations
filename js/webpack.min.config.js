var webpack = require('webpack');

module.exports = require('./webpack.config.js');

module.exports.plugins.unshift(
    new webpack.optimize.UglifyJsPlugin()
);

var extIndex = module.exports.output.filename.lastIndexOf('.js');
module.exports.output.filename = module.exports.output.filename.substring(0, extIndex) + '.min.js';
