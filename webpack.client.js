const path = require('path')
const {merge} = require('webpack-merge')
const baseConfig = require('./webpack.base')

const config = {
  entry: './src/client/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', {
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