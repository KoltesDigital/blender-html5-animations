var webpack = require('webpack');

var entry = require('./package.json').main;

var header = [
	'/**',
	' * Blender HTML5 Animations 1.0.0',
	' * Copyright 2016 Jonathan Giroux',
	' * MIT licence',
	' */',
].join('\n');

module.exports = {
	entry: entry,
	externals: {
		"gl-matrix": "window",
	},
	output: {
		path: 'dist',
		filename: 'blender-html5-animations.js',
		libraryTarget: 'umd',
		library: 'blenderHTML5Animations',
	},
	plugins: [
		new webpack.BannerPlugin(header, { raw: true }),
	],
};
