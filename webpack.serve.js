const path = require('path')
const nodeExternals = require('webpack-node-externals')
const {merge} = require('webpack-merge')
const baseConfig = require('./webpack.base')

const config = {
  target: 'node',
  entry: './src/server/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      
      {
        test: /\.css$/,
        use: ['isomorphic-style-loader', {
          loader: 'css-loader',
          options: {
            modules: true
          }
        }]
      }
    ]
  }
}


module.exports = merge(baseConfig, config)