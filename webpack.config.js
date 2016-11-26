const path = require('path');
const webpack = require('webpack');
const ClosureCompilerPlugin = require('webpack-closure-compiler');
module.exports = {
	entry: path.join(__dirname, 'src', 'index.js'),
	output: {
		path: path.join(__dirname, 'bin'),
		filename: 'index.js'
	},
	plugins: [
		new ClosureCompilerPlugin({
			compiler: {
				compilation_level: 'ADVANCED'
			},
//			jsCompiler: true,
			concurrency: 3
		}),
	]
};
