const path = require('path');
var UTF8Plugin = require('webpack-utf8-bom');

module.exports = {
  entry: './ui/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  plugins: [
    new UTF8Plugin(true)
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'lib'),
  },
};