const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: ['react-hot-loader/patch', './src/tapis-app/src/index.tsx'],
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader'
          }
        ],
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'html-loader',
        options: {},
      },
      {
        test: /\.(jpe?g|png|gif|svg|woff|woff2|eot|ttf|otf)$/,
        loader: 'file-loader',
      }
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    alias: {
      _common: path.resolve(__dirname, 'src/tapis-ui/src/_common/'),
      'tapis-ui': path.resolve(__dirname, 'src/tapis-ui/src/'),
      'tapis-app': path.resolve(__dirname, 'src/tapis-app/src/'),
      'tapis-redux': path.resolve(__dirname, 'src/tapis-redux/src/'),
      'tapis-util': path.resolve(__dirname, 'src/tapis-util/src/')
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new webpack.ProgressPlugin(),
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery',
      tv4: 'tv4',
    }),
  ],
};
