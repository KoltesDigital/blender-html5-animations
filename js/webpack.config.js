var webpack = require('webpack');

var entry = require('./package.json').main;

var header = [
	'/**',
	' * Blender HTML5 Animations',
	' * Copyright 2016 Jonathan Giroux',
	' * MIT licence',
	' */',
].join('\n');

module.exports = {
	entry: entry,
	externals: {
		"glMatrix": "glMatrix",
		"mat4": "mat4",
		"vec3": "vec3",
	},
	output: {
		path: 'dist',
		filename: 'blender-html5-animations.js',
		libraryTarget: 'umd',
	},
	plugins: [
		new webpack.BannerPlugin(header, { raw: true }),
	],
};
