const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
	entry: "./assets/scripts/Launcher.ts",
	mode: "development",
	output: {
		filename: "./assets/scripts/whattf.js",
		path: __dirname
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
		]
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	plugins: [
		new NodePolyfillPlugin()
	]
};
