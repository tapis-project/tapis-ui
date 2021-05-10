const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const webpack = require('webpack');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: 'https://localhost:3000/',
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
  },
  // serve assets via webpack serve
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    port: 3000,
    compress: true,
    hot: true,
    open: false,
  },
  module: {
    rules: [
      {
        test: /^(.)*\.module\.(css|sass|scss)$/i,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:10]',
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /^((?!\.module).)*\.(css|sass|scss)$/i,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      TAPIS_TENANT_URL: 'https://tacc.tapis.io/v3',
      TAPIS_AUTHENTICATOR_URL: 'https://tacc.tapis.io/v3/oauth2',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'tapis-ui', 'index.html'),
      inject: true,
    }),
    new HtmlWebpackHarddiskPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
});
